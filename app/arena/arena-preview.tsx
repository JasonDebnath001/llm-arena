"use client";

import { useState } from "react";
import { Metric, StatusBadge } from "../design-system/components";

type ResponseState = "complete" | "failed" | "streaming";
type PreviewResponse = Readonly<{
  body: readonly string[];
  id: "A" | "B" | "C";
  latency: string;
  state: ResponseState;
  tokens: string;
}>;

const models = ["Llama 3.3 70B", "Gemma 3 27B", "Qwen3 32B"] as const;
const responses: readonly PreviewResponse[] = [
  {
    id: "A",
    state: "complete",
    latency: "684 ms",
    tokens: "312",
    body: [
      "Start with a narrow contract around the provider call. The rest of the application should depend on a small stream of domain events, not on any provider SDK.",
      "That boundary gives retries, measurement, and safe errors one consistent home while keeping the first release easy to operate.",
    ],
  },
  {
    id: "B",
    state: "streaming",
    latency: "512 ms",
    tokens: "248",
    body: [
      "A modular monolith is the strongest starting point. Keep model execution, voting, and measurement as distinct feature modules inside one deployment.",
      "Use independently tagged stream events so one slow or failed response never blocks its siblings.",
    ],
  },
  { id: "C", state: "failed", latency: "1.8 s", tokens: "0", body: [] },
];

function ResponseCard({ response }: Readonly<{ response: PreviewResponse }>) {
  const responseId = `response-${response.id.toLowerCase()}`;
  return (
    <article
      className={`response-card response-${response.id.toLowerCase()}`}
      id={responseId}
      tabIndex={-1}
      aria-labelledby={`${responseId}-title`}
    >
      <header className="response-header">
        <div className="response-identity">
          <span className="response-letter" aria-hidden="true">
            {response.id}
          </span>
          <h2 id={`${responseId}-title`}>Response {response.id}</h2>
        </div>
        {response.state === "streaming" ? (
          <StatusBadge tone="live">
            <span className="live-dot" aria-hidden="true" /> Live
          </StatusBadge>
        ) : null}
        {response.state === "complete" ? (
          <StatusBadge tone="success">Complete</StatusBadge>
        ) : null}
        {response.state === "failed" ? (
          <StatusBadge tone="danger">Unavailable</StatusBadge>
        ) : null}
      </header>
      <div className="response-body">
        {response.state === "failed" ? (
          <div className="inline-error" role="alert">
            <strong>This response could not finish.</strong>
            <p>The other results are still ready to compare.</p>
            <button className="button button-secondary" type="button">
              Try response C again
            </button>
          </div>
        ) : (
          response.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        )}
      </div>
      <footer className="response-footer">
        <div
          className="measurement-row"
          aria-label={`Response ${response.id} measurements`}
        >
          <Metric icon="timer" label="Latency" value={response.latency} />
          <Metric icon="tokens" label="Tokens" value={response.tokens} />
          <Metric icon="spark" label="Cost" value="$0.0000" />
        </div>
        <button
          className="button button-vote"
          type="button"
          disabled={response.state === "failed"}
        >
          Vote for response {response.id}
        </button>
      </footer>
    </article>
  );
}

export function ArenaPreview() {
  const [selectedModels, setSelectedModels] =
    useState<readonly string[]>(models);
  function toggleModel(model: string) {
    setSelectedModels((current) =>
      current.includes(model)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== model)
        : current.length < 3
          ? [...current, model]
          : current,
    );
  }
  return (
    <>
      <section className="prompt-panel" aria-labelledby="prompt-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">New comparison</p>
            <h2 id="prompt-title">Ask once, compare honestly</h2>
          </div>
          <StatusBadge>{selectedModels.length} of 3 models</StatusBadge>
        </div>
        <fieldset className="model-selector">
          <legend>Models to compare</legend>
          <div className="model-options">
            {models.map((model) => {
              const selected = selectedModels.includes(model);
              return (
                <button
                  className="model-option"
                  type="button"
                  key={model}
                  aria-pressed={selected}
                  onClick={() => toggleModel(model)}
                >
                  <span className="selection-box" aria-hidden="true">
                    {selected ? "✓" : ""}
                  </span>
                  <span>
                    <strong>{model}</strong>
                    <small>Free tier · Available</small>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="prompt-field">
          <span>Prompt</span>
          <textarea
            rows={4}
            defaultValue="How would you structure an LLM comparison service so one provider failure never blocks the other results?"
          />
        </label>
        <div className="prompt-actions">
          <p>
            Prompts stay private. Model identities remain hidden until you vote.
          </p>
          <button className="button button-primary" type="button">
            Run blind comparison
          </button>
        </div>
      </section>
      <nav className="response-jump" aria-label="Jump to response">
        {responses.map((response) => (
          <a key={response.id} href={`#response-${response.id.toLowerCase()}`}>
            {response.id}
          </a>
        ))}
      </nav>
      <section className="comparison-region" aria-labelledby="comparison-title">
        <div className="comparison-toolbar">
          <div>
            <p className="eyebrow">Blind comparison</p>
            <h2 id="comparison-title">Two complete, one needs attention</h2>
          </div>
          <p className="privacy-cue">Identities hidden until your vote</p>
        </div>
        <div className="response-grid">
          {responses.map((response) => (
            <ResponseCard key={response.id} response={response} />
          ))}
        </div>
      </section>
    </>
  );
}
