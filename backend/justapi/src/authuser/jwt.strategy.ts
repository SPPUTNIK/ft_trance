import { Controller, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy, ExtractJwt} from "passport-jwt"

@Controller()
@Injectable()
export class JwStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([JwStrategy.extractJWT]),
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    private static extractJWT(req): string | null{
        let auth_token = req.handshake?.headers?.authorization;
        if (auth_token){
            return auth_token;
        }

        if (req.cookies && 'token' in req.cookies)
        {
            return req.cookies.token;
        }
        return null; 
    }

    async validate(payload: {id: string; email: string, istwofa: boolean})
    {
        return payload;
    }
}
