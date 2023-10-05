import { Module } from '@nestjs/common';
import { AuthuserService } from './authuser.service';
import { AuthuserController } from './authuser.controller';
import { intra42Strategy } from './42strategy'
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import {JwtModule} from '@nestjs/jwt';
import { JwStrategy } from './jwt.strategy';
import { TwoFactorAuthenticationService } from 'src/2fa/two-factor-auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, JwtModule,ConfigModule],
  controllers: [AuthuserController, JwStrategy],
  providers: [AuthuserService, intra42Strategy, PrismaService, TwoFactorAuthenticationService]
})
export class AuthuserModule {}
