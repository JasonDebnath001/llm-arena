"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import type { FormEvent } from "react";
import type { ComparisonEvent } from "@/features/comparisons/contracts";
import { Metric, StatusBadge } from "../design-system/components";
import type { PickerModel } from "./model-catalog";

type CardState = Readonly<{
  contestantId: string;
  attemptId: string;
  position: number;
  body: string;
  state: "pending" | "streaming" | "complete" | "failed";
  error: string | null;
  latency: number | null;
  tokens: number | null;
  modelName: string | null;
  versionLabel: string | null;
}>;
const letters = ["A", "B", "C"] as const;

function updateCard(
  cards: readonly CardState[],
  attemptId: string,
  update: (card: CardState) => CardState,
) {
  return cards.map((card) =>
    card.attemptId === attemptId ? update(card) : card,
  );
}

function ResponseCard({
  card,
  canVote,
  isVoting,
  onVote,
}: Readonly<{
  card: CardState;
  canVote: boolean;
  isVoting: boolean;
  onVote: () => void;
}>) {
  const letter = letters[card.position - 1] ?? "A";
  const id = `response-${letter.toLowerCase()}`;
  return (
    <article
      className={`response-card response-${letter.toLowerCase()}`}
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
    >
      <header className="response-header">
        <div className="response-identity">
          <span className="response-letter" aria-hidden="true">
            {letter}
          </span>
          <h2 id={`${id}-title`}>{card.modelName ?? `Response ${letter}`}</h2>
        </div>
        {card.state === "pending" ? <StatusBadge>Waiting</StatusBadge> : null}
        {card.state === "streaming" ? (
          <StatusBadge tone="live">
            <span className="live-dot" aria-hidden="true" /> Live
          </StatusBadge>
        ) : null}
        {card.state === "complete" ? (
          <StatusBadge tone="success">Complete</StatusBadge>
        ) : null}
        {card.state === "failed" ? (
          <StatusBadge tone="danger">Unavailable</StatusBadge>
        ) : null}
      </header>
      <div className="response-body">
        {card.state === "failed" ? (
          <div className="inline-error" role="alert">
            <strong>This response could not finish.</strong>
            <p>{card.error}</p>
          </div>
        ) : card.body ? (
          <p>{card.body}</p>
        ) : (
          <p aria-live="polite">Waiting for this model to begin…</p>
        )}
      </div>
      <footer className="response-footer">
        <div
          className="measurement-row"
          aria-label={`Response ${letter} measurements`}
        >
          <Metric
            icon="timer"
            label="Latency"
            value={card.latency === null ? "—" : `${card.latency} ms`}
          />
          <Metric
            icon="tokens"
            label="Tokens"
            value={card.tokens === null ? "—" : String(card.tokens)}
          />
          <Metric icon="spark" label="Cost" value="$0.0000" />
        </div>
        <button
          className="button button-vote"
          type="button"
          disabled={!canVote || isVoting || card.state !== "complete"}
          onClick={onVote}
        >
          {isVoting ? "Recording vote…" : `Vote for response ${letter}`}
        </button>
        {card.modelName ? (
          <p className="field-message">{card.versionLabel}</p>
        ) : null}
      </footer>
    </article>
  );
}

export function ArenaPreview({
  catalogError = false,
  initialModelIds = [],
  models,
}: Readonly<{
  catalogError?: boolean;
  initialModelIds?: readonly string[];
  models: readonly PickerModel[];
}>) {
  const { isSignedIn } = useUser();
  const [selectedModels, setSelectedModels] = useState<readonly string[]>(
    () => {
      const selectableModels = models.filter(
        (model) => model.availability !== "UNAVAILABLE",
      );
      const selectableIds = new Set(selectableModels.map((model) => model.id));
      const requestedIds = [...new Set(initialModelIds)]
        .filter((modelId) => selectableIds.has(modelId))
        .slice(0, 3);

      return requestedIds.length > 0
        ? requestedIds
        : selectableModels.slice(0, 3).map((model) => model.id);
    },
  );
  const [selectionMessage, setSelectionMessage] = useState("");
  const [cards, setCards] = useState<readonly CardState[]>([]);
  const [comparisonId, setComparisonId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [message, setMessage] = useState("");

  function toggleModel(modelId: string) {
    setSelectedModels((current) => {
      if (current.includes(modelId)) {
        if (current.length === 1) {
          setSelectionMessage("Keep at least one model selected.");
          return current;
        }
        setSelectionMessage("");
        return current.filter((id) => id !== modelId);
      }
      if (current.length === 3) {
        setSelectionMessage("You can compare up to three models at once.");
        return current;
      }
      setSelectionMessage("");
      return [...current, modelId];
    });
  }

  function applyEvent(event: ComparisonEvent) {
    if (event.type === "comparison_started") {
      setComparisonId(event.comparisonId);
      setCards(
        event.contestants.map((contestant) => ({
          ...contestant,
          body: "",
          state: "pending",
          error: null,
          latency: null,
          tokens: null,
          modelName: null,
          versionLabel: null,
        })),
      );
    } else if (event.type === "attempt_started") {
      setCards((current) =>
        updateCard(current, event.attemptId, (card) => ({
          ...card,
          state: "streaming",
        })),
      );
    } else if (event.type === "content_delta") {
      setCards((current) =>
        updateCard(current, event.attemptId, (card) => ({
          ...card,
          body: card.body + event.delta,
        })),
      );
    } else if (event.type === "attempt_completed") {
      setCards((current) =>
        updateCard(current, event.attemptId, (card) => ({
          ...card,
          state: "complete",
          latency: event.firstTokenMs ?? event.totalMs,
          tokens: event.outputTokens,
        })),
      );
    } else if (event.type === "attempt_failed") {
      setCards((current) =>
        updateCard(current, event.attemptId, (card) => ({
          ...card,
          state: "failed",
          error: event.message,
        })),
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = new FormData(event.currentTarget).get("prompt");
    if (typeof prompt !== "string" || !prompt.trim()) {
      setMessage("Enter a prompt to compare.");
      return;
    }
    setIsRunning(true);
    setCards([]);
    setComparisonId(null);
    setMessage("");
    try {
      const response = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, modelIds: selectedModels }),
      });
      if (!response.ok || !response.body) {
        const body: unknown = await response.json().catch(() => null);
        const detail =
          body && typeof body === "object"
            ? Reflect.get(body, "message")
            : null;
        throw new Error(
          typeof detail === "string"
            ? detail
            : "The comparison could not start.",
        );
      }
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      let pending = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        pending += value;
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        lines
          .filter(Boolean)
          .forEach((line) => applyEvent(JSON.parse(line) as ComparisonEvent));
      }
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The comparison could not finish.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  async function handleVote(attemptId: string) {
    if (!comparisonId) return;
    setIsVoting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/comparisons/${comparisonId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedAttemptId: attemptId }),
      });
      const body: unknown = await response.json();
      if (!response.ok || !body || typeof body !== "object")
        throw new Error(
          body &&
            typeof body === "object" &&
            typeof Reflect.get(body, "message") === "string"
            ? String(Reflect.get(body, "message"))
            : "Your vote could not be recorded.",
        );
      const reveal = Reflect.get(body, "reveal");
      if (Array.isArray(reveal))
        setCards((current) =>
          current.map((card) => {
            const identity = reveal.find(
              (item: unknown) =>
                item &&
                typeof item === "object" &&
                Reflect.get(item, "contestantId") === card.contestantId,
            );
            return identity && typeof identity === "object"
              ? {
                  ...card,
                  modelName: String(Reflect.get(identity, "modelName")),
                  versionLabel: String(Reflect.get(identity, "versionLabel")),
                }
              : card;
          }),
        );
      setMessage("Vote recorded. Model identities are now revealed.");
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Your vote could not be recorded.",
      );
    } finally {
      setIsVoting(false);
    }
  }

  const isTerminal =
    cards.length > 0 &&
    cards.every((card) => card.state === "complete" || card.state === "failed");
  return (
    <>
      <form
        className="prompt-panel"
        aria-labelledby="prompt-title"
        onSubmit={handleSubmit}
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">New comparison</p>
            <h2 id="prompt-title">Ask once, compare honestly</h2>
          </div>
          <StatusBadge>{selectedModels.length} of 3 models</StatusBadge>
        </div>
        <fieldset className="model-selector">
          <legend>Models to compare</legend>
          {models.length === 0 ? (
            <div
              className="inline-error"
              role={catalogError ? "alert" : "status"}
            >
              <strong>
                {catalogError
                  ? "Models could not be loaded."
                  : "No models are currently available."}
              </strong>
            </div>
          ) : (
            <div className="model-options">
              {models.map((model) => {
                const selected = selectedModels.includes(model.id);
                const unavailable = model.availability === "UNAVAILABLE";
                const context =
                  model.contextWindowTokens === null
                    ? null
                    : `${Math.round(model.contextWindowTokens / 1000)}K context`;
                return (
                  <label
                    className="model-option"
                    key={model.id}
                    data-selected={selected}
                    data-disabled={unavailable}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={unavailable || isRunning}
                      onChange={() => toggleModel(model.id)}
                    />
                    <span className="selection-box" aria-hidden="true">
                      {selected ? "✓" : ""}
                    </span>
                    <span>
                      <strong>{model.name}</strong>
                      <small>{model.description}</small>
                      <small>
                        Free tier · {model.availability.toLowerCase()}
                        {context ? ` · ${context}` : ""}
                      </small>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <p className="field-message" aria-live="polite">
            {selectionMessage}
          </p>
        </fieldset>
        <label className="prompt-field">
          <span>Prompt</span>
          <textarea
            name="prompt"
            rows={4}
            disabled={isRunning}
            placeholder="Ask the models something you are working on…"
          />
        </label>
        <div className="prompt-actions">
          <p>
            Prompts stay private. Model identities remain hidden until you vote.
          </p>
          <button
            className="button button-primary"
            type="submit"
            disabled={isRunning || selectedModels.length === 0}
          >
            {isRunning ? "Comparing…" : "Start blind comparison"}
          </button>
        </div>
        {message ? (
          <p className="form-status" role="status">
            {message}
          </p>
        ) : null}
      </form>
      {cards.length > 0 ? (
        <section
          className="comparison-region"
          aria-labelledby="comparison-title"
        >
          <div className="comparison-toolbar">
            <div>
              <p className="eyebrow">Blind comparison</p>
              <h2 id="comparison-title">
                {isTerminal
                  ? "Responses ready"
                  : "Responses arriving independently"}
              </h2>
            </div>
            <p className="privacy-cue">
              {cards.some((card) => card.modelName)
                ? "Identities revealed after your vote"
                : "Identities hidden until your vote"}
            </p>
          </div>
          <div className="response-grid">
            {cards.map((card) => (
              <ResponseCard
                key={card.attemptId}
                card={card}
                canVote={Boolean(isSignedIn) && isTerminal}
                isVoting={isVoting}
                onVote={() => void handleVote(card.attemptId)}
              />
            ))}
          </div>
          {!isSignedIn && isTerminal ? (
            <div className="form-status">
              <p>
                Sign in to vote. Identities stay hidden until the vote succeeds.
              </p>
              <SignInButton mode="modal">
                <button className="button button-primary" type="button">
                  Sign in to vote
                </button>
              </SignInButton>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
