import type { Metadata } from "next";
import Link from "next/link";
import { Metric, PageHeader, StatusBadge } from "../design-system/components";
import { modelCatalog } from "./model-catalog";

export const metadata: Metadata = { title: "Models" };

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
        {modelCatalog.map((model) => (
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
              <Metric icon="spark" label="Cost" value={model.cost} />
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
