import "dotenv/config";

import { prisma } from "../lib/prisma";

async function main() {
  await prisma.user.findFirst({
    select: { id: true },
  });

  console.log("✅ Connected.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
