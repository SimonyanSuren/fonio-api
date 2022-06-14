import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  private ROLES = [
    { name: 'admin' },
    { name: 'company_admin' },
    { name: 'dev' },
    { name: 'nonce' },
    { name: 'identity' },
    { name: 'anonIdentity' },
  ];

  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    for (const role of roles) {
      for (const rp of this.ROLES) {
        if (rp.name === role) {
          if (user.role === rp.name) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
