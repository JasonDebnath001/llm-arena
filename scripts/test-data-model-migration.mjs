import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import pg from "pg";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: join(repositoryRoot, ".env") });
// eslint-disable-next-line no-restricted-properties -- Honor shell/CI values after loading local .env.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured in .env");
}

const migrationPaths = [
  "20260822000000_comparison_data_model",
  "20260822010000_restrict_user_deletion",
];
const migration = (
  await Promise.all(
    migrationPaths.map((directory) =>
      readFile(
        join(repositoryRoot, "prisma", "migrations", directory, "migration.sql"),
        "utf8",
      ),
    ),
  )
).join("\n");
const schemaName = `data_model_test_${randomUUID().replaceAll("-", "")}`;
const quotedSchemaName = `"${schemaName}"`;
const client = new pg.Client({ connectionString: databaseUrl });

async function expectQueryFailure(query, message) {
  try {
    await client.query(query);
  } catch {
    return;
  }

  throw new Error(message);
}

await client.connect();

try {
  await client.query(`CREATE SCHEMA ${quotedSchemaName}`);
  await client.query(`SET search_path TO ${quotedSchemaName}`);
  await client.query(migration);

  const { rows } = await client.query(
    `SELECT COUNT(*)::integer AS count
     FROM pg_trigger AS trigger
     JOIN pg_class AS relation ON relation.oid = trigger.tgrelid
     JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
     WHERE namespace.nspname = $1
       AND trigger.tgname IN (
       'VoteRevision_successfulAttempt_trigger',
       'VoteRevision_immutable_trigger'
     )
       AND NOT trigger.tgisinternal`,
    [schemaName],
  );

  if (rows[0]?.count !== 2) {
    throw new Error("Expected vote-integrity triggers were not created");
  }

  const ids = {
    user: randomUUID(),
    modelVersion: randomUUID(),
    comparison: randomUUID(),
    contestant: randomUUID(),
    successfulAttempt: randomUUID(),
    failedAttempt: randomUUID(),
    vote: randomUUID(),
    firstRevision: randomUUID(),
    replacementRevision: randomUUID(),
  };

  await client.query(
    `INSERT INTO "User" ("id", "clerkSubject", "updatedAt")
     VALUES ($1, 'clerk_test_subject', CURRENT_TIMESTAMP)`,
    [ids.user],
  );
  await client.query(
    `INSERT INTO "Model" ("id", "name", "description", "updatedAt")
     VALUES ('test-model', 'Test model', 'Migration verification model', CURRENT_TIMESTAMP)`,
  );
  await client.query(
    `INSERT INTO "ModelVersion" (
       "id", "modelId", "providerModelId", "versionLabel", "capabilities", "effectiveFrom"
     ) VALUES ($1, 'test-model', 'provider/test', 'v1', '{}', CURRENT_TIMESTAMP)`,
    [ids.modelVersion],
  );
  await client.query(
    `INSERT INTO "Comparison" (
       "id", "promptCiphertext", "promptKeyVersion", "ownerId", "updatedAt"
     ) VALUES ($1, decode('01', 'hex'), 'v1', $2, CURRENT_TIMESTAMP)`,
    [ids.comparison, ids.user],
  );
  await client.query(
    `INSERT INTO "Contestant" (
       "id", "comparisonId", "modelVersionId", "displayPosition"
     ) VALUES ($1, $2, $3, 1)`,
    [ids.contestant, ids.comparison, ids.modelVersion],
  );
  await client.query(
    `INSERT INTO "ResponseAttempt" (
       "id", "contestantId", "comparisonId", "attemptNumber", "status",
       "errorCategory", "startedAt", "completedAt"
     ) VALUES
       ($1, $3, $4, 1, 'SUCCEEDED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
       ($2, $3, $4, 2, 'FAILED', 'UNAVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      ids.successfulAttempt,
      ids.failedAttempt,
      ids.contestant,
      ids.comparison,
    ],
  );

  await client.query("BEGIN");
  await client.query("SET CONSTRAINTS ALL DEFERRED");
  await client.query(
    `INSERT INTO "Vote" (
       "id", "comparisonId", "userId", "currentRevisionId", "updatedAt"
     ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
    [ids.vote, ids.comparison, ids.user, ids.firstRevision],
  );
  await client.query(
    `INSERT INTO "VoteRevision" (
       "id", "voteId", "comparisonId", "selectedAttemptId", "sequence"
     ) VALUES ($1, $2, $3, $4, 1)`,
    [
      ids.firstRevision,
      ids.vote,
      ids.comparison,
      ids.successfulAttempt,
    ],
  );
  await client.query("COMMIT");

  await expectQueryFailure(
    {
      text: `INSERT INTO "VoteRevision" (
               "id", "voteId", "comparisonId", "selectedAttemptId", "sequence"
             ) VALUES ($1, $2, $3, $4, 2)`,
      values: [randomUUID(), ids.vote, ids.comparison, ids.failedAttempt],
    },
    "A failed response attempt was accepted as a vote target",
  );
  await expectQueryFailure(
    {
      text: `INSERT INTO "Comparison" (
               "id", "ownerId", "claimTokenHash", "claimExpiresAt", "updatedAt"
             ) VALUES ($1, $2, decode('02', 'hex'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      values: [randomUUID(), ids.user],
    },
    "A comparison was allowed to be owned and anonymously claimable",
  );
  await expectQueryFailure(
    {
      text: `UPDATE "VoteRevision" SET "sequence" = 3 WHERE "id" = $1`,
      values: [ids.firstRevision],
    },
    "An immutable vote revision was updated",
  );
  await expectQueryFailure(
    {
      text: `DELETE FROM "User" WHERE "id" = $1`,
      values: [ids.user],
    },
    "A user with uncleared owned comparisons was deleted",
  );

  await client.query(
    `INSERT INTO "VoteRevision" (
       "id", "voteId", "comparisonId", "selectedAttemptId", "sequence"
     ) VALUES ($1, $2, $3, $4, 2)`,
    [
      ids.replacementRevision,
      ids.vote,
      ids.comparison,
      ids.successfulAttempt,
    ],
  );
  await client.query(
    `UPDATE "Vote" SET "currentRevisionId" = $1, "updatedAt" = CURRENT_TIMESTAMP
     WHERE "id" = $2`,
    [ids.replacementRevision, ids.vote],
  );

  console.log(
    "Migration and claim, attempt, immutable-revision, and replacement-vote invariants passed.",
  );
} finally {
  await client.query("SET search_path TO public");
  await client.query(`DROP SCHEMA ${quotedSchemaName} CASCADE`);
  await client.end();
}
