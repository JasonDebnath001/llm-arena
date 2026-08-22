import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Metric,
  PageHeader,
  StatusBadge,
} from "../../design-system/components";
import { findModelBySlug } from "../model-catalog";

export const metadata: Metadata = { title: "Model detail" };

type ModelDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ModelDetailPage({
  params,
}: ModelDetailPageProps) {
  const { slug } = await params;
  const model = findModelBySlug(slug);

  if (!model) {
    notFound();
  }

  return (
    <div className="page page-reading">
      <Link className="back-link" href="/models">
        ← All models
      </Link>
      <PageHeader
        eyebrow={`${model.maker} · ${model.family}`}
        title={model.name}
        description={model.description}
        action={<StatusBadge tone="success">Available now</StatusBadge>}
      />
      <section className="stat-grid" aria-label="Model performance summary">
        <Metric icon="leaderboard" label="Blind win record" value={model.win} />
        <Metric icon="status" label="Verified votes" value={model.votes} />
        <Metric icon="timer" label="Median latency" value={model.latency} />
        <Metric icon="spark" label="Measured cost" value={model.cost} />
      </section>
      <div className="detail-grid">
        <section className="data-panel">
          <p className="eyebrow">Capability profile</p>
          <h2>Where it performs well</h2>
          <ul className="feature-list">
            {model.capabilities.map(([label, detail]) => (
              <li key={label}>
                <strong>{label}</strong>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </section>
        <aside className="data-panel">
          <p className="eyebrow">Evidence quality</p>
          <h2>Read the rank carefully</h2>
          <p>
            Results are based on blind votes from completed comparisons.
            Performance can vary by prompt type, provider load, and model
            version.
          </p>
          <button className="button button-primary" type="button">
            Compare this model
          </button>
        </aside>
      </div>
    </div>
  );
}
