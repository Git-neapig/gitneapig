import { Body, Controller, Get, HttpCode, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "../auth/auth.service";
import { SessionGuard, type MemberRequest } from "../auth/session.guard";
import { RewardsService } from "../progress/rewards.service";
import { ProfileService } from "../profile/profile.service";
import { ContentService } from "./content.service";
@Controller("api/v1")
export class ContentController {
  constructor(private readonly content: ContentService,
    private readonly auth: AuthService,
    private readonly rewards: RewardsService,
    private readonly profiles: ProfileService
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
  @Patch("lessons/:id/progress") @UseGuards(SessionGuard) progress(
    @Req() request: MemberRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.content.progress(request.user.id, id, body);
  }
  @Post("lessons/:id/complete")
  @HttpCode(200)
  @UseGuards(SessionGuard)
  completeLesson(
    @Req() request: MemberRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.rewards.complete(request.user.id, "LESSON", id, body);
  }
  @Get("quests") async quests(@Req() request: Request) {
    return this.content.quests((await this.auth.user(request, true))?.id);
  }
  @Get("quests/:slug") async quest(
    @Param("slug") slug: string,
    @Req() request: Request,
  ) {
    return this.content.quest(slug, (await this.auth.user(request, true))?.id);
  }
  @Post("quests/:id/complete")
  @HttpCode(200)
  @UseGuards(SessionGuard)
  completeQuest(
    @Req() request: MemberRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.rewards.complete(request.user.id, "QUEST", id, body);
  }
  @Get("achievements") achievements() {
    return this.profiles.achievements();
  }
}
