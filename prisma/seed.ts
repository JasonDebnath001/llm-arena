import "dotenv/config";

import { ModelAvailability } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.model.upsert({
    where: { id: "example-free-model" },
    update: {},
    create: {
      id: "example-free-model",
      name: "Example free model",
      description: "Replace this seed record with a supported provider model.",
      availability: ModelAvailability.UNAVAILABLE,
      versions: {
        create: {
          providerModelId: "example/free-model",
          versionLabel: "seed",
          capabilities: { textGeneration: true },
          effectiveFrom: new Date("2026-08-22T00:00:00.000Z"),
        },
      },
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
