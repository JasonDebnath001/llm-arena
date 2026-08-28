import type { Metadata } from "next";
import Link from "next/link";
import {
  formatCost,
  formatInteger,
  formatLatency,
  formatWinRate,
} from "@/features/leaderboard/leaderboard";
import { formatContextWindow } from "@/features/models/model-catalog";
import {
  EmptyState,
  Metric,
  PageHeader,
  StatusBadge,
} from "../design-system/components";
import { loadModelCatalog } from "./model-catalog";

export const metadata: Metadata = { title: "Models" };
export const dynamic = "force-dynamic";

const availability = {
  available: { label: "Available", tone: "success" },
  degraded: { label: "Degraded", tone: "warning" },
  unavailable: { label: "Unavailable", tone: "neutral" },
} as const;

export default async function ModelsPage() {
  const modelCatalog = await loadModelCatalog().catch(() => null);

  return (
    <div className="page page-reading">
      <PageHeader
        eyebrow="Model catalog"
        title="Know what is in the arena."
        description="Browse supported free tier models, their availability, and the evidence collected from real comparisons."
        action={
          <a className="button button-secondary" href="#availability-guide">
            Availability guide
          </a>
        }
      />
      {modelCatalog === null ? (
        <EmptyState
          icon="status"
          title="The model catalog is temporarily unavailable"
          action={
            <Link className="button button-primary" href="/models">
              Try again
            </Link>
          }
        >
          <p>
            Current availability and comparison evidence could not be loaded.
            The Arena is unaffected if its model selector is available.
          </p>
        </EmptyState>
      ) : modelCatalog.length === 0 ? (
        <EmptyState icon="models" title="No models are in the catalog yet">
          <p>
            Add a supported provider model before starting a blind comparison.
          </p>
        </EmptyState>
      ) : (
        <section className="model-grid" aria-label="Model catalog">
          {modelCatalog.map((model) => {
            const modelAvailability = availability[model.availability];

            return (
              <article className="model-card" key={model.id}>
                <header>
                  <div>
                    <p className="eyebrow">{model.provider}</p>
                    <h2>{model.name}</h2>
                  </div>
                  <StatusBadge tone={modelAvailability.tone}>
                    {modelAvailability.label}
                  </StatusBadge>
                </header>
                <p>{model.description}</p>
                <p className="model-evidence">
                  {formatInteger(model.ratings)} rated appearances ·{" "}
                  {formatInteger(model.successfulRuns)} measured calls
                </p>
                <div
                  className="measurement-row"
                  aria-label={`${model.name} summary measurements`}
                >
                  <Metric
                    icon="leaderboard"
                    label="Win record"
                    value={formatWinRate(model.winRate)}
                  />
                  <Metric
                    icon="timer"
                    label="Latency"
                    value={formatLatency(model.medianFirstTokenLatencyMs)}
                  />
                  <Metric
                    icon="tokens"
                    label="Context"
                    value={formatContextWindow(model.contextWindowTokens)}
                  />
                  <Metric
                    icon="spark"
                    label="Cost"
                    value={formatCost(model.averageCostUsdTenThousandths)}
                  />
                </div>
                <Link className="text-link" href={`/models/${model.id}`}>
                  View model details <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
        </section>
      )}

      <section
        className="data-panel availability-guide"
        id="availability-guide"
        aria-labelledby="availability-guide-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Availability guide</p>
            <h2 id="availability-guide-title">What each status means</h2>
          </div>
          <StatusBadge>Live catalog state</StatusBadge>
        </div>
        <ol className="methodology-list">
          <li>
            <span>01</span>
            <div>
              <strong>Available</strong>
              <p>
                The model has an active provider version and can be selected for
                a new comparison.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Degraded</strong>
              <p>
                The model remains selectable, but provider reliability or
                capacity may be reduced.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Unavailable</strong>
              <p>
                The model stays visible for historical evidence but cannot start
                a new comparison.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
