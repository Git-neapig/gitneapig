import { Controller, Get, Param, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "../auth/auth.service";
import { ContentService } from "./content.service";
@Controller("api/v1")
export class ContentController {
  constructor(private readonly content: ContentService,
    private readonly auth: AuthService
  ) {}
  @Get("lessons") async lessons(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.auth.user(request, true);
    if (!user) {
      response.setHeader("Cache-Control", "public, max-age=300");
      response.setHeader("X-GitneaPig-Cache", "public-lesson");
    }
    return this.content.lessons(user?.id);
  }
  @Get("lessons/:slug") async lesson(
    @Param("slug") slug: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.auth.user(request, true),
      lesson = await this.content.lesson(slug, user?.id);
    if (lesson.guestAccessible) {
      response.setHeader("Cache-Control", "public, max-age=300");
      response.setHeader("X-GitneaPig-Cache", "public-lesson");
    }
    return lesson;
  }
}
