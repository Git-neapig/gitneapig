import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedContent } from "../src/content/seed";
config({ path: "../../.env", quiet: true });
const prisma = new PrismaClient();
seedContent(prisma)
  .then(() =>
    console.info(
      "Seeded 5 lessons, 5 quests, 5 daily templates, 10 achievements and 30 command references.",
    ),
  )
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
