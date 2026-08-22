import type { Metadata } from "next";
import Link from "next/link";
import {
  Metric,
  PageHeader,
  StatusBadge,
} from "../../design-system/components";

export const metadata: Metadata = { title: "Model detail" };

export default function ModelDetailPage() {
  return (
    <div className="page page-reading">
      <Link className="back-link" href="/models">
        ← All models
      </Link>
      <PageHeader
        eyebrow="Alibaba Cloud · Qwen"
        title="Qwen3 32B"
        description="A reasoning focused open model currently available through a free tier provider."
        action={<StatusBadge tone="success">Available now</StatusBadge>}
      />
      <section className="stat-grid" aria-label="Model performance summary">
        <Metric icon="leaderboard" label="Blind win record" value="68%" />
        <Metric icon="status" label="Verified votes" value="142" />
        <Metric icon="timer" label="Median latency" value="720 ms" />
        <Metric icon="spark" label="Measured cost" value="$0.0000" />
      </section>
      <div className="detail-grid">
        <section className="data-panel">
          <p className="eyebrow">Capability profile</p>
          <h2>Where it performs well</h2>
          <ul className="feature-list">
            <li>
              <strong>Reasoning</strong>
              <span>Multi step technical analysis</span>
            </li>
            <li>
              <strong>Coding</strong>
              <span>Implementation and debugging</span>
            </li>
            <li>
              <strong>Context</strong>
              <span>Long document understanding</span>
            </li>
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
