import "server-only";

import { ModelAvailability, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const activeVersionWhere = (now: Date) =>
  ({
    effectiveFrom: { lte: now },
    OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
  }) satisfies Prisma.ModelVersionWhereInput;

export type ModelCatalogRecord = Readonly<{
  availability: ModelAvailability;
  description: string;
  id: string;
  name: string;
  version: Readonly<{
    capabilities: Prisma.JsonValue;
    contextWindowTokens: number | null;
    providerModelId: string;
    versionLabel: string;
  }> | null;
}>;

export async function getModelCatalogRecords(
  now = new Date(),
): Promise<ModelCatalogRecord[]> {
  const models = await prisma.model.findMany({
    orderBy: { name: "asc" },
    select: {
      availability: true,
      description: true,
      id: true,
      name: true,
      versions: {
        where: activeVersionWhere(now),
        orderBy: { effectiveFrom: "desc" },
        take: 1,
        select: {
          capabilities: true,
          contextWindowTokens: true,
          providerModelId: true,
          versionLabel: true,
        },
      },
    },
  });

  return models.map(({ versions, ...model }) => ({
    ...model,
    availability:
      versions.length === 0
        ? ModelAvailability.UNAVAILABLE
        : model.availability,
    version: versions[0] ?? null,
  }));
}
