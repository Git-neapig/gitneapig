import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService, currentUser } from "./auth.service";
@ApiTags("Authentication")
@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post("signup") signup(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.auth.signup(body, response);
  }
  @Post("login") @HttpCode(200) login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.auth.login(body, response);
  }
  @Get("me") async me(@Req() request: Request) {
    return { user: currentUser(await this.auth.requiredUser(request)) };
  }
  @Post("logout") @HttpCode(204) logout(
    @Res({ passthrough: true }) response: Response,
  ) {
    this.auth.logout(response);
  }
  @Get("42") start(
    @Query("returnTo") returnTo: unknown,
    @Res() response: Response,
  ) {
    this.auth.oauthStart(returnTo, response);
  }
  @Get("42/callback") callback(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    return this.auth.oauthCallback(request, response);
  }
  @Post("42/onboarding")
  @UseInterceptors(
    FileInterceptor("avatar", {
      limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 2 },
    }),
  )
  onboard(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: unknown,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.auth.onboard(request, response, body, file);
  }
}
