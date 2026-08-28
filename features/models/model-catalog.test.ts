import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ModelLeaderboardEvidence } from "@/infrastructure/database/leaderboard";
import type { ModelCatalogRecord } from "@/infrastructure/database/models";
import { buildModelCatalog, formatContextWindow } from "./model-catalog";

const records: readonly ModelCatalogRecord[] = [
  {
    availability: "AVAILABLE",
    description: "A model used to exercise the catalog projection.",
    id: "test-model",
    name: "Test Model",
    version: {
      capabilities: {
        coding: true,
        reasoning: true,
        unsupportedFlag: false,
      },
      contextWindowTokens: 128_000,
      providerModelId: "nvidia/test-model:free",
      versionLabel: "provider-2026-08-28",
    },
  },
  {
    availability: "AVAILABLE",
    description: "A catalog record without a currently active version.",
    id: "expired-model",
    name: "Expired Model",
    version: null,
  },
];

const evidence: readonly ModelLeaderboardEvidence[] = [
  {
    availability: "available",
    averageCostUsdTenThousandths: 0,
    latencySampleCount: 7,
    medianFirstTokenLatencyMs: 640,
    modelId: "test-model",
    modelName: "Test Model",
    ratings: 10,
    successfulRuns: 12,
    wins: 6,
  },
];

describe("buildModelCatalog", () => {
  it("joins current model metadata with verified comparison evidence", () => {
    const [model] = buildModelCatalog(records, evidence);

    assert.equal(model.provider, "NVIDIA");
    assert.equal(model.availability, "available");
    assert.equal(model.isComparable, true);
    assert.equal(model.winRate, 0.6);
    assert.equal(model.ratings, 10);
    assert.equal(model.medianFirstTokenLatencyMs, 640);
    assert.deepEqual(
      model.capabilities.map((capability) => capability.label),
      ["Coding", "Reasoning"],
    );
  });

  it("keeps a model visible but not comparable without an active version", () => {
    const model = buildModelCatalog(records, evidence).find(
      (candidate) => candidate.id === "expired-model",
    );

    assert.ok(model);
    assert.equal(model.availability, "unavailable");
    assert.equal(model.isComparable, false);
    assert.equal(model.ratings, 0);
    assert.equal(model.winRate, null);
    assert.equal(model.provider, "No active provider");
  });
});

describe("formatContextWindow", () => {
  it("formats published token limits without overstating precision", () => {
    assert.equal(formatContextWindow(null), "Not published");
    assert.equal(formatContextWindow(128_000), "128K tokens");
    assert.equal(formatContextWindow(1_048_576), "1M tokens");
  });
});
