import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { AuthuserModule } from './authuser/authuser.module';
import { PrismaModule } from './prisma/prisma.module';
// import { WebsocketsModule } from './websockets/websockets.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ChatModule } from './websockets/chat/chat.module';
import { WebsocketsModule } from './websockets/chat/websockets.module';

@Module({
  imports: [AuthuserModule, PrismaModule, ChatModule, WebsocketsModule, ThrottlerModule.forRoot({ttl: 1, limit: 5})],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }
  ],
})
export class AppModule {}

