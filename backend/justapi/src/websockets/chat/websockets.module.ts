import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { GameGateway } from '../game/game.gateway';
import { GameService } from '../game/game.service';
import { JwStrategy } from 'src/authuser/jwt.strategy';
import { ChatService } from './chat.service';


@Module({
    providers: [ChatGateway, ChatService, GameService, GameGateway, PrismaService],
    controllers: [GameGateway, JwStrategy],
    imports: [JwtModule.register({
        secret: process.env.JWT_SECRET
    })]
})
export class WebsocketsModule { }
