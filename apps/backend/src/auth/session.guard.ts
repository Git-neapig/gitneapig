import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { User } from "@prisma/client";
import type { Request } from "express";
import { AuthService } from "./auth.service";
export type MemberRequest = Request & { user: User };
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<MemberRequest>();
    request.user = await this.auth.requiredUser(request);
    return true;
  }
}
