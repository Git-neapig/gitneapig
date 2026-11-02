import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { SessionGuard, type MemberRequest } from "../auth/session.guard";
import { ProfileService } from "./profile.service";
@ApiTags("Profile")
@ApiCookieAuth("gitneapig_session")
@UseGuards(SessionGuard)
@Controller("api/v1/profile")
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}
  @Get() profile(@Req() request: MemberRequest) {
    return this.profiles.profile(request.user);
  }
  @Patch() update(@Req() request: MemberRequest, @Body() body: unknown) {
    return this.profiles.update(request.user, body);
  }
  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("avatar", {
      limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  avatar(
    @Req() request: MemberRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.profiles.upload(request.user, file);
  }
  @Get("achievements") achievements(@Req() request: MemberRequest) {
    return this.profiles.achievements(request.user.id);
  }
}
