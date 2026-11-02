import { ApiOperation } from "@nestjs/swagger";
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
import { BookmarksService } from "./bookmarks.service";
@UseGuards(SessionGuard)
@Controller("api/v1")
export class BookmarksController {
  constructor(private readonly bookmarks: BookmarksService) {}
  @ApiOperation({ operationId: "SocialController_bookmarkList" })
  @Get("bookmarks") bookmarkList(
    @Req() request: MemberRequest,
    @Query() query: unknown,
  ) {
    return this.bookmarks.list(request.user.id, query);
  }
  @ApiOperation({ operationId: "SocialController_createBookmark" })
  @Post("bookmarks") createBookmark(
    @Req() request: MemberRequest,
    @Body() body: unknown,
  ) {
    return this.bookmarks.save(request.user.id, body);
  }
  @ApiOperation({ operationId: "SocialController_deleteBookmark" })
  @Delete("bookmarks/:id") @HttpCode(204) deleteBookmark(
    @Req() request: MemberRequest,
    @Param("id") id: string,
  ) {
    return this.bookmarks.delete(request.user.id, id);
  }
}
