import Link from "next/link";
import {
  EmptyState,
  Metric,
  StatusBadge,
} from "@/app/design-system/components";
import type { Leaderboard, LeaderboardRow } from "./leaderboard";
import {
  MINIMUM_RATINGS,
  formatCost,
  formatInteger,
  formatLatency,
  formatWinRate,
} from "./leaderboard";

const availability = {
  available: { label: "Available", tone: "success" },
  degraded: { label: "Degraded", tone: "warning" },
  unavailable: { label: "Unavailable", tone: "neutral" },
} as const;

function formatRank(rank: number | null) {
  return rank === null ? "—" : String(rank).padStart(2, "0");
}

function qualificationLabel(row: LeaderboardRow) {
  if (row.isEligible) return `Ranked ${formatRank(row.rank)}`;
  if (row.ratingsNeeded === MINIMUM_RATINGS) return "Awaiting first rating";
  return `${formatInteger(row.ratingsNeeded)} more to rank`;
}

function LeaderboardTable({ rows }: Readonly<{ rows: Leaderboard["rows"] }>) {
  return (
    <div className="table-wrap leaderboard-table-wrap">
      <table>
        <caption className="sr-only">
          All-time model rankings based on completed blind ratings
        </caption>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Model</th>
            <th scope="col">Win record</th>
            <th scope="col">Ratings</th>
            <th scope="col">Median latency</th>
            <th scope="col">Average cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const modelAvailability = availability[row.availability];

            return (
              <tr key={row.modelId} data-eligible={row.isEligible}>
                <td data-label="Rank">
                  <span className="rank">{formatRank(row.rank)}</span>
                  <small className="qualification-note">
                    {qualificationLabel(row)}
                  </small>
                </td>
                <th scope="row" data-label="Model">
                  <span className="model-name">{row.modelName}</span>
                  <StatusBadge tone={modelAvailability.tone}>
                    {modelAvailability.label}
                  </StatusBadge>
                </th>
                <td data-label="Win record">
                  <strong>{formatWinRate(row.winRate)}</strong>
                  <small>
                    {formatInteger(row.wins)} {row.wins === 1 ? "win" : "wins"}
                  </small>
                </td>
                <td data-label="Ratings">
                  {formatInteger(row.ratings)}
                  {!row.isEligible ? (
                    <progress
                      aria-label={`${row.modelName} ranking qualification progress`}
                      max={MINIMUM_RATINGS}
                      value={row.ratings}
                    />
                  ) : null}
                </td>
                <td data-label="Median latency">
                  {formatLatency(row.medianFirstTokenLatencyMs)}
                  <small>
                    {formatInteger(row.latencySampleCount)} latency samples
                  </small>
                </td>
                <td data-label="Average cost">
                  {formatCost(row.averageCostUsdTenThousandths)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LeaderboardView({
  leaderboard,
}: Readonly<{ leaderboard: Leaderboard }>) {
  if (leaderboard.rows.length === 0) {
    return (
      <EmptyState icon="leaderboard" title="No models are in the arena yet">
        <p>
          Add a supported model to the catalog before collecting comparisons and
          rankings.
        </p>
        <Link className="button button-primary" href="/models">
          Browse the model catalog
        </Link>
      </EmptyState>
    );
  }

  const eligibleSummary =
    leaderboard.eligibleModelCount === 0
      ? "No model has reached the ranking threshold yet. Every completed blind rating moves the board closer to its first qualified result."
      : `${formatInteger(leaderboard.eligibleModelCount)} ${leaderboard.eligibleModelCount === 1 ? "model has" : "models have"} enough evidence to rank. Models still collecting ratings remain visible below the ranked entries.`;

  return (
    <>
      <section className="leaderboard-summary" aria-label="Leaderboard summary">
        <Metric
          icon="leaderboard"
          label="Ranked models"
          value={formatInteger(leaderboard.eligibleModelCount)}
        />
        <Metric
          icon="spark"
          label="Verified blind votes"
          value={formatInteger(leaderboard.totalVerifiedVotes)}
        />
        <Metric
          icon="timer"
          label="Measured calls"
          value={formatInteger(leaderboard.totalMeasuredRuns)}
        />
      </section>

      <aside className="notice notice-warning">
        <strong>Evidence threshold: {MINIMUM_RATINGS} ratings</strong>
        <p>{eligibleSummary}</p>
      </aside>

      <section className="data-panel" aria-labelledby="ranking-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Overall ranking</p>
            <h2 id="ranking-title">All-time free-tier results</h2>
          </div>
          <a className="button button-secondary" href="#methodology">
            How ranking works
          </a>
        </div>
        <LeaderboardTable rows={leaderboard.rows} />
      </section>

      <section
        className="data-panel leaderboard-methodology"
        id="methodology"
        aria-labelledby="methodology-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Methodology</p>
            <h2 id="methodology-title">What counts on this board</h2>
          </div>
          <StatusBadge>All time</StatusBadge>
        </div>
        <ol className="methodology-list">
          <li>
            <span>01</span>
            <div>
              <strong>One current vote</strong>
              <p>
                A comparison contributes only its latest verified vote, so a
                changed choice is never counted twice.
              </p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Completed appearances</strong>
              <p>
                Win record is wins divided by rated appearances with a
                successful response. Models rank after {MINIMUM_RATINGS} such
                ratings.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Server-measured speed</strong>
              <p>
                Latency is the median time to first token from the latest
                successful attempt for each appearance. Cost is averaged across
                those successful calls.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </>
  );
}

export function LeaderboardUnavailable() {
  return (
    <EmptyState
      icon="status"
      title="The leaderboard is temporarily unavailable"
    >
      <p>
        Ranking evidence could not be loaded. Your comparisons and votes are
        unaffected.
      </p>
      <Link className="button button-primary" href="/leaderboard">
        Try again
      </Link>
    </EmptyState>
  );
}
