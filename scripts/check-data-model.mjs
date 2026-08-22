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
const userDeletionMigrationPath = join(
  repositoryRoot,
  "prisma",
  "migrations",
  "20260822010000_restrict_user_deletion",
  "migration.sql",
);
const userDeletionPath = join(repositoryRoot, "lib", "delete-user.ts");

const [schema, migration, userDeletionMigration, userDeletion, projections] =
  await Promise.all([
  readFile(schemaPath, "utf8"),
  readFile(migrationPath, "utf8"),
  readFile(userDeletionMigrationPath, "utf8"),
  readFile(userDeletionPath, "utf8"),
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
  "onDelete: Restrict",
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
const requiredUserDeletionFragments = [
  "prisma.$transaction",
  "responseCiphertext: null",
  "responseKeyVersion: null",
  "promptCiphertext: null",
  "promptKeyVersion: null",
  "ownerId: null",
  "transaction.user.delete",
];

function findMissingFragments(content, fragments) {
  return fragments.filter((fragment) => !content.includes(fragment));
}

const missingSchemaFragments = findMissingFragments(schema, requiredSchemaFragments);
const missingMigrationFragments = findMissingFragments(
  migration,
  requiredMigrationFragments,
);
const missingUserDeletionFragments = findMissingFragments(userDeletion, [
  ...requiredUserDeletionFragments,
]);
const missingUserDeletionMigrationFragments = findMissingFragments(
  userDeletionMigration,
  ['ON DELETE RESTRICT'],
);
const forbiddenBlindProjectionFragments = [
  "modelVersionId: true",
  "providerModelId: true",
  "responseCiphertext: true",
];
const blindProjection = projections.slice(
  projections.indexOf("const responseMeasurementSelect"),
  projections.indexOf("export const revealedComparisonSelect"),
);
const exposedBlindFragments = forbiddenBlindProjectionFragments.filter((fragment) =>
  blindProjection.includes(fragment),
);

if (
  missingSchemaFragments.length > 0 ||
  missingMigrationFragments.length > 0 ||
  missingUserDeletionFragments.length > 0 ||
  missingUserDeletionMigrationFragments.length > 0 ||
  exposedBlindFragments.length > 0
) {
  throw new Error(
    [
      ...missingSchemaFragments.map((fragment) => `Schema is missing: ${fragment}`),
      ...missingMigrationFragments.map(
        (fragment) => `Migration is missing: ${fragment}`,
      ),
      ...missingUserDeletionFragments.map(
        (fragment) => `User deletion workflow is missing: ${fragment}`,
      ),
      ...missingUserDeletionMigrationFragments.map(
        (fragment) => `User deletion migration is missing: ${fragment}`,
      ),
      ...exposedBlindFragments.map(
        (fragment) => `Blind projection exposes: ${fragment}`,
      ),
    ].join("\n"),
  );
}

console.log("Data-model schema and database invariants are present.");
