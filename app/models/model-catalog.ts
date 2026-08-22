export const modelCatalog = [
  {
    slug: "qwen3-32b",
    name: "Qwen3 32B",
    maker: "Alibaba Cloud",
    family: "Qwen",
    description:
      "A reasoning focused open model currently available through a free tier provider.",
    detail:
      "Strong reasoning and coding performance with a generous context window.",
    win: "68%",
    votes: "142",
    latency: "720 ms",
    cost: "$0.0000",
    capabilities: [
      ["Reasoning", "Multi step technical analysis"],
      ["Coding", "Implementation and debugging"],
      ["Context", "Long document understanding"],
    ],
  },
  {
    slug: "llama-3-3-70b",
    name: "Llama 3.3 70B",
    maker: "Meta",
    family: "Llama",
    description:
      "A dependable general model for instruction following and technical writing.",
    detail:
      "A dependable general model for instruction following and technical writing.",
    win: "61%",
    votes: "128",
    latency: "860 ms",
    cost: "$0.0000",
    capabilities: [
      ["Instructions", "Reliable instruction following"],
      ["Writing", "Clear technical communication"],
      ["Reasoning", "Broad general problem solving"],
    ],
  },
  {
    slug: "gemma-3-27b",
    name: "Gemma 3 27B",
    maker: "Google",
    family: "Gemma",
    description:
      "A fast multilingual and multimodal model available through a free tier provider.",
    detail:
      "Fast, concise responses with broad multilingual and multimodal capability.",
    win: "54%",
    votes: "116",
    latency: "640 ms",
    cost: "$0.0000",
    capabilities: [
      ["Multilingual", "Responses across many languages"],
      ["Multimodal", "Text and image understanding"],
      ["Efficiency", "Fast, concise responses"],
    ],
  },
] as const;

export function findModelBySlug(slug: string) {
  return modelCatalog.find((model) => model.slug === slug);
}
