import "server-only";

import { serverEnvironment } from "@/infrastructure/env";

export type ProviderDelta = Readonly<{ delta: string }>;
export type ProviderUsage = Readonly<{
  inputTokens: number | null;
  outputTokens: number | null;
}>;

function readUsage(value: unknown): ProviderUsage | null {
  if (!value || typeof value !== "object") return null;
  const usage = Reflect.get(value, "usage");
  if (!usage || typeof usage !== "object") return null;
  const prompt = Reflect.get(usage, "prompt_tokens");
  const completion = Reflect.get(usage, "completion_tokens");
  return {
    inputTokens: typeof prompt === "number" ? prompt : null,
    outputTokens: typeof completion === "number" ? completion : null,
  };
}

function readDelta(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const choices = Reflect.get(value, "choices");
  if (!Array.isArray(choices)) return "";
  const first = choices[0];
  if (!first || typeof first !== "object") return "";
  const delta = Reflect.get(first, "delta");
  if (!delta || typeof delta !== "object") return "";
  const content = Reflect.get(delta, "content");
  return typeof content === "string" ? content : "";
}

export async function streamOpenRouter(
  model: string,
  prompt: string,
  signal: AbortSignal,
  onDelta: (delta: ProviderDelta) => void,
) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverEnvironment.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        usage: { include: true },
      }),
      signal,
    },
  );

  if (!response.ok || !response.body) {
    const error = new Error("Provider request failed");
    Object.assign(error, { status: response.status });
    throw error;
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let pending = "";
  let usage: ProviderUsage = { inputTokens: null, outputTokens: null };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    pending += value;
    const lines = pending.split("\n");
    pending = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      const payload: unknown = JSON.parse(line.slice(6));
      const delta = readDelta(payload);
      if (delta) onDelta({ delta });
      usage = readUsage(payload) ?? usage;
    }
  }

  return usage;
}
