import "reflect-metadata";
import { Controller, DynamicModule, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import express, { type NextFunction, type Request, type Response } from "express";
import { resolve } from "node:path";
import type { Configuration } from "./config";
import { PrismaService } from "./database/prisma.service";
import { ApiExceptionFilter } from "./common/errors";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";

export function originAllowed(
  method: string,
  path: string,
  origin: unknown,
  appOrigin: string,
): boolean {
  return (
    ["GET", "HEAD", "OPTIONS"].includes(method) ||
    path.startsWith("/api/v1/public/") ||
    origin === appOrigin
  );
}
@Controller("api/v1/health")
class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  }
}
@Module({})
export class ApplicationModule {
  static register(config: Configuration): DynamicModule {
    return {
      module: ApplicationModule,
      controllers: [
        HealthController,
        AuthController,
      ],
      providers: [
        { provide: "CONFIG", useValue: config },
        PrismaService,
        AuthService,
      ],
    };
  }
}
export async function createApplication(
  config: Configuration,
): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    ApplicationModule.register(config),
    { bodyParser: false },
  );
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-origin" } }));
  app.use(cookieParser());
  app.use(
    "/api",
    (request: Request, response: Response, next: NextFunction) => {
      response.setHeader("Cache-Control", "no-store");
      response.vary("Cookie");
      const path = request.originalUrl.split("?")[0];
      if (
        !originAllowed(
          request.method,
          path,
          request.headers.origin,
          config.APP_ORIGIN,
        )
      ) {
        response.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "The request origin is not allowed.",
          },
        });
        return;
      }
      next();
    },
  );
  app.use(express.json({ limit: "64kb" }));
  app.use(express.urlencoded({ extended: false, limit: "16kb" }));
  app.use(
    "/uploads/avatars",
    express.static(resolve(config.AVATAR_UPLOAD_DIR), {
      dotfiles: "deny",
      index: false,
      cacheControl: false,
      fallthrough: false,
      setHeaders: (response) => {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Cache-Control", "no-store");
      },
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  const docs = new DocumentBuilder()
    .setTitle("GitneaPig API")
    .setDescription(
      "Public bookmarks use X-API-Key only. Create and revoke keys in your profile. Each valid key is limited to 60 requests per 60 seconds. Internal endpoints use the session cookie and require the configured Origin for unsafe methods.",
    )
    .setVersion("1.0")
    .addCookieAuth("gitneapig_session")
    .addApiKey({ type: "apiKey", in: "header", name: "X-API-Key" }, "apiKey")
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, docs),
    { swaggerOptions: { persistAuthorization: false } },
  );
  app.enableShutdownHooks();
  return app;
}
