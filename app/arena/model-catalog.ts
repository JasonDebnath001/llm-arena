import "server-only";

import { ModelAvailability, Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const activeVersionWhere = (now: Date) =>
  ({
    effectiveFrom: { lte: now },
    OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
  }) satisfies Prisma.ModelVersionWhereInput;

export type PickerModel = Readonly<{
  availability: ModelAvailability;
  contextWindowTokens: number | null;
  description: string;
  id: string;
  name: string;
}>;

export async function listPickerModels(
  now = new Date(),
): Promise<PickerModel[]> {
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
        select: { contextWindowTokens: true },
      },
    },
  });

  return models.map(({ versions, ...model }) => ({
    ...model,
    availability:
      versions.length === 0
        ? ModelAvailability.UNAVAILABLE
        : model.availability,
    contextWindowTokens: versions[0]?.contextWindowTokens ?? null,
  }));
}

export async function resolvePickerSelection(
  modelIds: readonly string[],
  now = new Date(),
) {
  const models = await prisma.model.findMany({
    where: {
      id: { in: [...modelIds] },
      availability: {
        in: [ModelAvailability.AVAILABLE, ModelAvailability.DEGRADED],
      },
    },
    select: {
      id: true,
      name: true,
      versions: {
        where: activeVersionWhere(now),
        orderBy: { effectiveFrom: "desc" },
        take: 1,
        select: { id: true, providerModelId: true, versionLabel: true },
      },
    },
  });

  const resolvedById = new Map(
    models.flatMap((model) => {
      const version = model.versions[0];
      return version ? [[model.id, { ...model, version }] as const] : [];
    }),
  );

  return modelIds
    .map((id) => resolvedById.get(id))
    .filter((model) => model !== undefined);
}
