import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IdentityGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        console.log("IdentityGuard", user);
        if (!user.isIdentity) {
            return false;
        }
        return true;
    }
}