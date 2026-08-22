import type { Metadata } from "next";
import Link from "next/link";
import { Metric, PageHeader, StatusBadge } from "../design-system/components";

export const metadata: Metadata = { title: "Models" };
const modelCards = [
  {
    slug: "qwen3-32b",
    name: "Qwen3 32B",
    maker: "Alibaba Cloud",
    win: "68%",
    latency: "720 ms",
    detail:
      "Strong reasoning and coding performance with a generous context window.",
  },
  {
    slug: "llama-3-3-70b",
    name: "Llama 3.3 70B",
    maker: "Meta",
    win: "61%",
    latency: "860 ms",
    detail:
      "A dependable general model for instruction following and technical writing.",
  },
  {
    slug: "gemma-3-27b",
    name: "Gemma 3 27B",
    maker: "Google",
    win: "54%",
    latency: "640 ms",
    detail:
      "Fast, concise responses with broad multilingual and multimodal capability.",
  },
] as const;

export default function ModelsPage() {
  return (
    <div className="page page-reading">
      <PageHeader
        eyebrow="Model catalog"
        title="Know what is in the arena."
        description="Browse supported free tier models, their availability, and the evidence collected from real comparisons."
        action={
          <button className="button button-secondary" type="button">
            Availability guide
          </button>
        }
      />
      <section className="model-grid" aria-label="Available models">
        {modelCards.map((model) => (
          <article className="model-card" key={model.slug}>
            <header>
              <div>
                <p className="eyebrow">{model.maker}</p>
                <h2>{model.name}</h2>
              </div>
              <StatusBadge tone="success">Available</StatusBadge>
            </header>
            <p>{model.detail}</p>
            <div className="measurement-row">
              <Metric icon="leaderboard" label="Win record" value={model.win} />
              <Metric icon="timer" label="Latency" value={model.latency} />
              <Metric icon="spark" label="Cost" value="$0.0000" />
            </div>
            <Link className="text-link" href={`/models/${model.slug}`}>
              View model details <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
