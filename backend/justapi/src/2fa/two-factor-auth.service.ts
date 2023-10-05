import { Injectable, Req } from '@nestjs/common';
import { authenticator } from 'otplib';
import { AuthuserService } from '../authuser/authuser.service';
import { ConfigService } from '@nestjs/config';
import { toFileStream } from 'qrcode';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor (
    private readonly usersService: AuthuserService,
    private readonly configService: ConfigService,
    private prisma: PrismaService
  ) {}
 
  public async generateTwoFactorAuthenticationSecret(@Req() req) {
    const secret = authenticator.generateSecret();
 
    const otpauthUrl = authenticator.keyuri(req.user.email, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
 
    await this.usersService.set2faSecretDB(secret, req.user.id);
    return {secret,otpauthUrl}
  }

  public  isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationSecret, twoFactorAuthenticationCode) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: twoFactorAuthenticationSecret
    })
  }

}
