import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedContent } from "../src/content/seed";
config({ path: "../../.env", quiet: true });
const prisma = new PrismaClient();
seedContent(prisma)
  .then(() =>
    console.info(
      "Seeded 5 lessons, 10 achievements, 5 quests, 5 daily templates and 12 command references.",
    ),
  )
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
