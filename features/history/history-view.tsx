import Link from "next/link";
import { Icon } from "@/app/design-system/icons";
import { StatusBadge } from "@/app/design-system/components";
import { HistoryDeleteDialog } from "@/app/history/history-delete-dialog";
import type { HistoryDetail, HistoryListItem } from "./history";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function responseWord(count: number) {
  return `${count} ${count === 1 ? "response" : "responses"}`;
}

function responseLetter(position: number) {
  return String.fromCharCode(64 + position);
}

function formatLatency(value: number | null) {
  if (value === null) return "Unavailable";
  if (value < 1_000) return `${Math.round(value)} ms`;
  return `${(value / 1_000).toFixed(1)} s`;
}

function formatTokens(value: number | null) {
  return value === null ? "Unavailable" : value.toLocaleString("en");
}

function formatCost(value: number) {
  return `$${(value / 10_000).toFixed(4)}`;
}

export function HistoryList({
  items,
  totalCount,
}: Readonly<{
  items: readonly HistoryListItem[];
  totalCount: number;
}>) {
  return (
    <section aria-labelledby="history-list-title">
      <div className="section-heading history-heading">
        <div>
          <p className="eyebrow">Retained records</p>
          <h2 id="history-list-title">Recent comparisons</h2>
        </div>
        <StatusBadge>
          {totalCount.toLocaleString("en")}{" "}
          {totalCount === 1 ? "record" : "records"}
        </StatusBadge>
      </div>
      <ol className="history-list">
        {items.map((item) => (
          <li key={item.id}>
            <article className="history-item">
              <div className="history-item-main">
                <div className="history-item-topline">
                  <time dateTime={item.createdAt.toISOString()}>
                    {dateFormatter.format(item.createdAt)}
                  </time>
                  <div className="history-badges">
                    <StatusBadge tone={item.completion.tone}>
                      {item.completion.label}
                    </StatusBadge>
                    <StatusBadge>{item.voteLabel}</StatusBadge>
                  </div>
                </div>
                <p className="history-prompt-preview">{item.promptPreview}</p>
                <p className="history-response-count">
                  {responseWord(item.responseCount)} compared
                </p>
              </div>
              <div className="history-actions">
                <Link
                  className="button button-secondary"
                  href={`/history/${item.id}`}
                >
                  Open
                  <Icon name="chevronRight" />
                </Link>
                <HistoryDeleteDialog
                  comparisonId={item.id}
                  promptPreview={item.promptPreview}
                />
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HistoryDetailView({
  comparison,
}: Readonly<{ comparison: HistoryDetail }>) {
  return (
    <>
      <section
        className="history-prompt-panel"
        aria-labelledby="saved-prompt-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Saved prompt</p>
            <h2 id="saved-prompt-title">What you asked</h2>
          </div>
          <StatusBadge tone={comparison.completion.tone}>
            {comparison.completion.label}
          </StatusBadge>
        </div>
        <p className="history-prompt-full">{comparison.prompt}</p>
      </section>

      <section
        className="history-responses"
        aria-labelledby="saved-responses-title"
      >
        <div className="comparison-toolbar">
          <div>
            <p className="eyebrow">Saved results</p>
            <h2 id="saved-responses-title">Compared responses</h2>
          </div>
          <p className="privacy-cue">Visible only in your private history</p>
        </div>
        <div className="response-grid">
          {comparison.responses.map((response) => {
            const letter = responseLetter(response.position);
            const identity = response.modelName
              ? `${response.modelName}${response.versionLabel ? ` · ${response.versionLabel}` : ""}`
              : "Identity hidden";

            return (
              <article
                className={`response-card response-${letter.toLowerCase()}`}
                data-selected={response.selected || undefined}
                key={response.id}
              >
                <header className="response-header">
                  <div className="response-identity">
                    <span className="response-letter" aria-hidden="true">
                      {letter}
                    </span>
                    <div>
                      <h2>Response {letter}</h2>
                      <p>{identity}</p>
                    </div>
                  </div>
                  <div className="history-response-status">
                    {response.selected ? (
                      <StatusBadge tone="success">Your vote</StatusBadge>
                    ) : null}
                    <StatusBadge tone={response.stateTone}>
                      {response.stateLabel}
                    </StatusBadge>
                  </div>
                </header>
                <div className="response-body history-response-body">
                  {response.body ? (
                    <p>{response.body}</p>
                  ) : (
                    <div className="inline-error">
                      <strong>Response unavailable</strong>
                      <p>
                        {response.failureMessage ??
                          "The retained response content could not be opened."}
                      </p>
                    </div>
                  )}
                </div>
                <footer className="response-footer">
                  <div className="measurement-row">
                    <div className="metric">
                      <Icon name="timer" />
                      <span>First token</span>
                      <strong>
                        {formatLatency(response.firstTokenLatencyMs)}
                      </strong>
                    </div>
                    <div className="metric">
                      <Icon name="tokens" />
                      <span>Output tokens</span>
                      <strong>{formatTokens(response.outputTokens)}</strong>
                    </div>
                    <div className="metric">
                      <Icon name="spark" />
                      <span>Cost</span>
                      <strong>
                        {formatCost(response.costUsdTenThousandths)}
                      </strong>
                    </div>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
