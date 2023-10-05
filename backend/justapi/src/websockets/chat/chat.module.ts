import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthuserService } from '../../authuser/authuser.service';
import { ChatController } from './chat.controller';
import { intra42Strategy } from '../../authuser/42strategy'
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaModule } from '../../prisma/prisma.module';
import {JwtModule} from '@nestjs/jwt';
import { JwStrategy } from '../../authuser/jwt.strategy';
import { TwoFactorAuthenticationService } from '../../2fa/two-factor-auth.service';
import { ConfigModule } from '@nestjs/config';
import { GameService } from '../game/game.service';

@Module({
  imports: [PrismaModule, JwtModule,ConfigModule],
  controllers: [ChatController, JwStrategy],
  providers: [ChatService, AuthuserService, intra42Strategy, PrismaService, TwoFactorAuthenticationService, GameService]
})
export class ChatModule {}