import { Body, Controller, HttpCode, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { AuthService } from "./auth.service";
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
}
