import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import type { Configuration } from "../config";
import { ApiError } from "../common/errors";
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject("CONFIG") config: Configuration) {
    super({ datasourceUrl: config.DATABASE_URL });
  }
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
  async serializable<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 15000,
        });
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          !["P2034", "P2002"].includes(error.code)
        )
          throw error;
        if (attempt === 2)
          throw new ApiError(
            409,
            "CONCURRENT_UPDATE_RETRY_EXHAUSTED",
            "Concurrent update. Please retry.",
          );
        await new Promise((resolve) => setTimeout(resolve, 10 * 2 ** attempt));
      }
    }
    throw new ApiError(
      409,
      "CONCURRENT_UPDATE_RETRY_EXHAUSTED",
      "Please retry.",
    );
  }
}
