import "dotenv/config";

import { prisma } from "../lib/prisma";

async function main() {
  await prisma.user.upsert({
    where: { email: "ada@example.com" },
    update: { name: "Ada Lovelace" },
    create: {
      email: "ada@example.com",
      name: "Ada Lovelace",
      posts: {
        create: [
          { title: "Welcome to Prisma Postgres", published: true },
          { title: "A draft for later" },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "grace@example.com" },
    update: { name: "Grace Hopper" },
    create: {
      email: "grace@example.com",
      name: "Grace Hopper",
      posts: {
        create: [{ title: "Databases and compilers", published: true }],
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
