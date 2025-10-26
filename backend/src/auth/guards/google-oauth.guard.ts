import {AuthGuard} from "@nestjs/passport";
import {ExecutionContext, Injectable} from "@nestjs/common";

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
    getAuthenticateOptions(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const departmentId = request.query.departmentId;

        return {
            state: JSON.stringify({departmentId}),
            scope: ['email', 'profile'],
        };
    }
}