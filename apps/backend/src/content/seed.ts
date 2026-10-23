import { Prisma, PrismaClient } from "@prisma/client";
import { lessons } from "./lessons";
export const json = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export async function seedContent(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      for (const content of lessons) {
        const data = {
          slug: content.slug,
          order: content.order,
          guestAccessible: content.guestAccessible,
          xpReward: content.xpReward,
          content: json(content),
        };
        await tx.lesson.upsert({
          where: { id: content.id },
          create: { id: content.id, ...data },
          update: data,
        });
      }
    },
    { timeout: 30_000 },
  );
}
