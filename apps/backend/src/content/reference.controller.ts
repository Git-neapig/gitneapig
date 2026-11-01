import { ApiOperation } from "@nestjs/swagger";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { SessionGuard } from "../auth/session.guard";
import { ContentService } from "./content.service";
@Controller("api/v1")
export class ReferenceController {
  constructor(private readonly content: ContentService) {}
  @ApiOperation({ operationId: "ContentController_reference" })
  @Get("reference/commands") @UseGuards(SessionGuard) reference(
    @Query() query: unknown,
  ) {
    return this.content.reference(query);
  }
  @ApiOperation({ operationId: "ContentController_referenceDetail" })
  @Get("reference/commands/:key") @UseGuards(SessionGuard) referenceDetail(
    @Param("key") key: string,
  ) {
    return this.content.referenceDetail(key);
  }
}
