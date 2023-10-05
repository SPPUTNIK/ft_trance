import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { MyIp, Myport } from 'src/main';

config();

@Injectable()
export class intra42Strategy extends PassportStrategy(Strategy, '42') {

  constructor() {
    super({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: `http://${MyIp}:${Myport}/auth-user/redirect`,
    });
  }

  async validate (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, username, emails, image } = profile
    const user = {
      id,
      username,
      email: emails[0].value,
      image: profile._json.image.link
    }
    done(null, user);
  }

}

