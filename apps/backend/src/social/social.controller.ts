import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SessionGuard, type MemberRequest } from "../auth/session.guard";
import { FriendsService } from "./friends.service";
@UseGuards(SessionGuard)
@Controller("api/v1")
export class SocialController {
  constructor(private readonly friends: FriendsService) {}
  @Get("friends") list(@Req() request: MemberRequest) {
    return this.friends.list(request.user.id);
  }
  @Get("friends/requests") requests(@Req() request: MemberRequest) {
    return this.friends.list(request.user.id, true);
  }
  @Get("users/search") search(
    @Req() request: MemberRequest,
    @Query() query: unknown,
  ) {
    return this.friends.search(request.user.id, query);
  }
  @Post("friends/requests") request(
    @Req() request: MemberRequest,
    @Body() body: unknown,
  ) {
    return this.friends.request(request.user.id, body);
  }
  @Post("friends/requests/:id/accept") @HttpCode(204) accept(
    @Req() request: MemberRequest,
    @Param("id") id: string,
  ) {
    return this.friends.accept(request.user.id, id);
  }
  @Delete("friends/requests/:id") @HttpCode(204) cancel(
    @Req() request: MemberRequest,
    @Param("id") id: string,
  ) {
    return this.friends.cancel(request.user.id, id);
  }
  @Delete("friends/:userId") @HttpCode(204) remove(
    @Req() request: MemberRequest,
    @Param("userId") id: string,
  ) {
    return this.friends.remove(request.user.id, id);
  }
}
