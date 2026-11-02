import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import {
  ApiKeyGuard,
  type PublicApiRequest,
} from "../profile/api-keys.service";
import { BookmarksService } from "../social/bookmarks.service";
import { lessonStageTypes } from "@gitneapig/shared";
const bookmarkInput = {
  type: "object" as const,
  additionalProperties: false,
  required: ["targetType", "targetId"],
  properties: {
    targetType: {
      type: "string" as const,
      enum: ["LESSON", "QUEST", "COMMAND"],
    },
    targetId: { type: "string" as const, example: "lesson-1" },
    stage: {
      type: "string" as const,
      enum: [...lessonStageTypes],
      nullable: true,
      description:
        "LESSON only. Omitted/null defaults to SITUATION. Other targets must omit it or use null.",
    },
  },
};
const bookmarkOutput = {
  type: "object" as const,
  properties: {
    id: { type: "string" as const, format: "uuid" },
    targetType: {
      type: "string" as const,
      enum: ["LESSON", "QUEST", "COMMAND"],
    },
    targetId: { type: "string" as const },
    stage: {
      type: "string" as const,
      enum: [...lessonStageTypes],
      nullable: true,
    },
    createdAt: { type: "string" as const, format: "date-time" },
  },
};
@ApiTags("Public Bookmarks")
@ApiSecurity("apiKey")
@UseGuards(ApiKeyGuard)
@ApiResponse({
  status: 401,
  description:
    "Missing, invalid or revoked X-API-Key. Cookies are not accepted.",
})
@ApiResponse({
  status: 429,
  description:
    "60 requests per 60 seconds per valid key. Retry-After contains seconds until reset.",
})
@Controller("api/v1/public/bookmarks")
export class PublicBookmarksController {
  constructor(private readonly bookmarks: BookmarksService) {}
  @Get()
  @ApiOperation({ summary: "List your bookmarks" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiQuery({
    name: "targetType",
    required: false,
    enum: ["LESSON", "QUEST", "COMMAND"],
  })
  list(@Req() request: PublicApiRequest, @Query() query: unknown) {
    return this.bookmarks.list(request.apiUserId, query);
  }
  @Get(":id")
  @ApiOperation({ summary: "Get one owned bookmark" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, schema: bookmarkOutput })
  get(@Req() request: PublicApiRequest, @Param("id") id: string) {
    return this.bookmarks.get(request.apiUserId, id);
  }
  @Post()
  @ApiOperation({ summary: "Create a bookmark for an existing target" })
  @ApiBody({ schema: bookmarkInput })
  @ApiResponse({ status: 201, schema: bookmarkOutput })
  @ApiResponse({ status: 409, description: "Target already bookmarked." })
  create(@Req() request: PublicApiRequest, @Body() body: unknown) {
    return this.bookmarks.save(request.apiUserId, body);
  }
  @Put(":id")
  @ApiOperation({ summary: "Change an owned bookmark target" })
  @ApiParam({ name: "id", type: String })
  @ApiBody({ schema: bookmarkInput })
  @ApiResponse({ status: 200, schema: bookmarkOutput })
  update(
    @Req() request: PublicApiRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.bookmarks.save(request.apiUserId, body, id);
  }
  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete an owned bookmark" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 204, description: "Deleted. No response body." })
  delete(@Req() request: PublicApiRequest, @Param("id") id: string) {
    return this.bookmarks.delete(request.apiUserId, id);
  }
}
