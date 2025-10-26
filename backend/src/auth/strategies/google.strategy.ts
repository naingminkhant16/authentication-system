import {PassportStrategy} from "@nestjs/passport";
import {Strategy, VerifyCallback} from 'passport-google-oauth2';
import {Injectable} from "@nestjs/common";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            scope: ['profile', 'email'],
            passReqToCallback: true
        });
    }

    async validate(
        req: any,
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const {id, name, emails} = profile;
        const state = req.query.state ? JSON.parse(req.query.state) : null;
        
        const user = {
            provider: 'google',
            providerId: id,
            email: emails[0].value,
            name: `${name.givenName} ${name.familyName}`,
            departmentId: state?.departmentId ?? null,
        };

        done(null, user);
    }
}