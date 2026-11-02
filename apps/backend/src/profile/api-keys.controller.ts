import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SessionGuard, type MemberRequest } from "../auth/session.guard";
import { ApiKeysService } from "./api-keys.service";
@ApiTags("Profile")
@ApiCookieAuth("gitneapig_session")
@UseGuards(SessionGuard)
@Controller("api/v1/profile")
export class ApiKeysController {
  constructor(private readonly keys: ApiKeysService) {}
  @ApiOperation({ operationId: "ProfileController_apiKeys" })
  @Get("api-keys") apiKeys(@Req() request: MemberRequest) {
    return this.keys.list(request.user.id);
  }
  @ApiOperation({ operationId: "ProfileController_createKey" })
  @Post("api-keys") createKey(
    @Req() request: MemberRequest,
    @Body() body: unknown,
  ) {
    return this.keys.create(request.user.id, body);
  }
  @ApiOperation({ operationId: "ProfileController_revokeKey" })
  @Delete("api-keys/:id") @HttpCode(204) revokeKey(
    @Req() request: MemberRequest,
    @Param("id") id: string,
  ) {
    return this.keys.revoke(request.user.id, id);
  }
}
