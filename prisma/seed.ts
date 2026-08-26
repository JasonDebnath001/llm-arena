import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { ModelAvailability } from "../generated/prisma/client";
import { PrismaClient } from "../generated/prisma/client";
import { databaseEnvironment } from "../infrastructure/database-environment";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseEnvironment.url }),
});

async function main() {
  const supportedModels = [
    {
      id: "glm-5-2",
      name: "GLM 5.2",
      description: "Long-context reasoning for coding and agentic work.",
      providerModelId: "z-ai/glm-5.2:free",
      versionLabel: "openrouter-2026-08-26",
      contextWindowTokens: 256000,
      effectiveFrom: new Date("2026-08-26T00:00:00.000Z"),
      capabilities: {
        textGeneration: true,
        reasoning: true,
        coding: true,
        agentic: true,
      },
    },
    {
      id: "nemotron-3-ultra",
      name: "Nemotron 3 Ultra",
      description:
        "Frontier reasoning and orchestration with a million-token context.",
      providerModelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
      versionLabel: "openrouter-2026-08-26",
      contextWindowTokens: 1000000,
      effectiveFrom: new Date("2026-08-26T00:00:00.000Z"),
      capabilities: {
        textGeneration: true,
        reasoning: true,
        agentic: true,
      },
    },
    {
      id: "minimax-m3",
      name: "MiniMax M3",
      description:
        "Multimodal foundation model for long-context agent workflows.",
      providerModelId: "minimax/minimax-m3:free",
      versionLabel: "openrouter-2026-08-26",
      contextWindowTokens: 1048576,
      effectiveFrom: new Date("2026-08-26T00:00:00.000Z"),
      capabilities: {
        textGeneration: true,
        multimodal: true,
        agentic: true,
      },
    },
  ] as const;

  await prisma.model.updateMany({
    data: { availability: ModelAvailability.UNAVAILABLE },
  });

  for (const model of supportedModels) {
    const {
      capabilities,
      contextWindowTokens,
      effectiveFrom,
      providerModelId,
      versionLabel,
      ...catalogModel
    } = model;

    await prisma.model.upsert({
      where: { id: model.id },
      update: {
        name: model.name,
        description: model.description,
        availability: ModelAvailability.AVAILABLE,
      },
      create: {
        ...catalogModel,
        availability: ModelAvailability.AVAILABLE,
      },
    });

    await prisma.modelVersion.upsert({
      where: {
        modelId_versionLabel: { modelId: model.id, versionLabel },
      },
      update: {},
      create: {
        modelId: model.id,
        providerModelId,
        versionLabel,
        capabilities,
        contextWindowTokens,
        effectiveFrom,
      },
    });
  }

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
