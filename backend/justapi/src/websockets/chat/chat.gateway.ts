import { Injectable,  Req, Res, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from 'src/authuser/jwt.guard';
import { ChatService } from './chat.service';



@WebSocketGateway({ cors: { origin: '*' } })

@Injectable()
export class ChatGateway 
{
  constructor(private readonly ChatService: ChatService) { }
  @WebSocketServer()

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('connected')
  async getNewUser(@ConnectedSocket() client: Socket, @Req() req, @Res() res) {
    return await this.ChatService.getNewUser(client, req, res)
  } 

  @UseGuards(JwtAuthGuard)
  async handleDisconnect(client: Socket) {
    return await this.ChatService.handleDisconnect(client)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('Dms')
  async sendDm(@MessageBody() info, @ConnectedSocket() client: Socket, @Req() req) {
    return await this.ChatService.sendDm(info, client, req)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('kickUser')
  async kickUser(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    return await this.ChatService.kickUser(body, client, req)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('banUser')
  async banuser(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    return await this.ChatService.banuser(body, client, req)  
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('addUser')
  async addUser(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    return await this.ChatService.addUser(body, client, req)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('leaveRoom')
  async leaveRoom(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    return await this.ChatService.leaveRoom(body, client, req)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('textRoom')
  async textRoom(@MessageBody() body, @ConnectedSocket() client: Socket, @Req() req) {
    return await this.ChatService.textRoom(body, client, req)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('createRoom')
  async createRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req) {
    return await this.ChatService.createRoom(body, client, req)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket, @Req() req) {
    return await this.ChatService.joinRoom(body, client, req)
}
}

