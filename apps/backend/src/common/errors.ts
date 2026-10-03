import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Response } from "express";
import { ZodError } from "zod";
export class ApiError extends HttpException {
  constructor(status: number, code: string, message: string, field?: string) {
    super({ error: { code, message, ...(field ? { field } : {}) } }, status);
  }
}
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (response.headersSent) return;
    response.setHeader("Cache-Control", "no-store");
    if (error instanceof ZodError) {
      response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Check the submitted fields.",
          field: error.issues[0]?.path.join("."),
        },
      });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        response.status(409).json({
          error: { code: "CONFLICT", message: "This record already exists." },
        });
        return;
      }
      if (error.code === "P2025") {
        response.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "The requested record does not exist.",
          },
        });
        return;
      }
    }
    if (error instanceof HttpException) {
      const body = error.getResponse();
      response.status(error.getStatus()).json(
        typeof body === "object" &&
          "error" in body &&
          typeof body.error === "object"
          ? body
          : {
              error: {
                code:
                  error.getStatus() === 413
                    ? "FILE_TOO_LARGE"
                    : "REQUEST_ERROR",
                message:
                  error.getStatus() === 413
                    ? "The upload exceeds 2 MB."
                    : "The request could not be processed.",
              },
            },
      );
      return;
    }
    if (
      error instanceof Error &&
      "status" in error &&
      typeof error.status === "number" &&
      [400, 403, 404, 413, 415].includes(error.status)
    ) {
      response.status(error.status).json({
        error: {
          code:
            error.status === 404
              ? "NOT_FOUND"
              : error.status === 413
                ? "FILE_TOO_LARGE"
                : "REQUEST_ERROR",
          message: "The request could not be processed.",
        },
      });
      return;
    }
    this.logger.error(error instanceof Error ? error.name : "UnhandledError");
    response.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  }
}
