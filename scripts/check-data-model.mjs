import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = join(repositoryRoot, "prisma", "schema.prisma");
const projectionsPath = join(
  repositoryRoot,
  "infrastructure",
  "database",
  "comparison-projections.ts",
);
const migrationPath = join(
  repositoryRoot,
  "prisma",
  "migrations",
  "20260822000000_comparison_data_model",
  "migration.sql",
);

const [schema, migration, projections] = await Promise.all([
  readFile(schemaPath, "utf8"),
  readFile(migrationPath, "utf8"),
  readFile(projectionsPath, "utf8"),
]);

const requiredSchemaFragments = [
  "model Comparison",
  "model Contestant",
  "model ResponseAttempt",
  "model Vote",
  "model VoteRevision",
  "claimTokenHash",
  "promptCiphertext",
  "responseCiphertext",
  '@relation("CurrentVoteRevision"',
  "@@unique([contestantId, attemptNumber])",
];

const requiredMigrationFragments = [
  'CONSTRAINT "Comparison_ownership_check"',
  'CONSTRAINT "Comparison_claimEnvelope_check"',
  'CONSTRAINT "Contestant_displayPosition_check"',
  'CONSTRAINT "ResponseAttempt_terminalState_check"',
  'CONSTRAINT "ResponseAttempt_freeTierCost_check"',
  "DEFERRABLE INITIALLY DEFERRED",
  'CREATE TRIGGER "VoteRevision_successfulAttempt_trigger"',
  'CREATE TRIGGER "VoteRevision_immutable_trigger"',
];

function findMissingFragments(content, fragments) {
  return fragments.filter((fragment) => !content.includes(fragment));
}

const missingSchemaFragments = findMissingFragments(schema, requiredSchemaFragments);
const missingMigrationFragments = findMissingFragments(
  migration,
  requiredMigrationFragments,
);
const forbiddenBlindProjectionFragments = [
  "modelVersionId: true",
  "providerModelId: true",
  "responseCiphertext: true",
];
const blindProjection = projections.slice(
  projections.indexOf("export const blindComparisonSelect"),
  projections.indexOf("export const revealedComparisonSelect"),
);
const exposedBlindFragments = forbiddenBlindProjectionFragments.filter((fragment) =>
  blindProjection.includes(fragment),
);

if (
  missingSchemaFragments.length > 0 ||
  missingMigrationFragments.length > 0 ||
  exposedBlindFragments.length > 0
) {
  throw new Error(
    [
      ...missingSchemaFragments.map((fragment) => `Schema is missing: ${fragment}`),
      ...missingMigrationFragments.map(
        (fragment) => `Migration is missing: ${fragment}`,
      ),
      ...exposedBlindFragments.map(
        (fragment) => `Blind projection exposes: ${fragment}`,
      ),
    ].join("\n"),
  );
}

console.log("Data-model schema and database invariants are present.");
