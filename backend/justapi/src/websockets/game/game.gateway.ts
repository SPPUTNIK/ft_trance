import { Controller, Get, Injectable, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { JwtAuthGuard } from 'src/authuser/jwt.guard';
import { twofaGuard } from 'src/authuser/guards/2fa.guard';


@Controller('game')
@WebSocketGateway({ cors: { origin: '*' } })

export class GameGateway {
  constructor(private readonly gameService: GameService) { }

  @UseGuards(JwtAuthGuard, twofaGuard)
  @SubscribeMessage('getnewgame')
  async getNewGame(@ConnectedSocket() client, @Res() res, @Req() req, @MessageBody() body) {
    try {
      await this.gameService.getNewGame(client, req, body);
    }
    catch (error) {
      return res.sendStatus(404);
    }
  }

  @Get('/notifications')
  @UseGuards(JwtAuthGuard, twofaGuard)
  async getNotifications(@Res() res, @Req() req) {
    try {
      await this.gameService.getNotifications(req, res);
    }
    catch (error) {
      return res.sendStatus(404);
    }
  }

  @Get('/gamechecker')
  @UseGuards(JwtAuthGuard, twofaGuard)
  async gamechercker(@Res() res, @Req() req) {
    try {
      await this.gameService.gamechecker(req, res);
    }
    catch (error) {
      return res.sendStatus(404);
    }
  }

  @Get('/history')
  @UseGuards(JwtAuthGuard, twofaGuard)
  async getHistory(@Res() res, @Req() req, @Query('skip') skip: string, @Query('take') take: string) {
    try {
      await this.gameService.getHistory(req, res, skip, take);
    }
    catch (error) {
      return res.sendStatus(404);
    }
  }

  @Get('/getStream/:roomid')
  @UseGuards(JwtAuthGuard, twofaGuard)
  async getStream(@Res() res, @Param() roomid) {
    try {
      await this.gameService.getStream(res, roomid);
    }
    catch (error) {
      return res.sendStatus(404);
    }
  }

  @Get('/streamlist')
  @UseGuards(JwtAuthGuard, twofaGuard)
  async getStreamList(@Res() res, @Query('skip') skip: string, @Query('take') take: string) {
    try {
      await this.gameService.getStreamList(res, skip, take);
    }
    catch (error) {
      // return res.send(error);
      return res.sendStatus(404);
    }
  }

  @UseGuards(JwtAuthGuard, twofaGuard)
  @SubscribeMessage('random-game')
  async randomGame(@Req() req, @ConnectedSocket() client) {
    try {
      await this.gameService.randomGame(client, req);
    }
    catch (error) {
      return 'error';
    }
  }

  @UseGuards(JwtAuthGuard, twofaGuard)
  @SubscribeMessage('accept-game')
  async acceptGame(@Req() req, @ConnectedSocket() client, @MessageBody() body) {
    try {
      await this.gameService.acceptGame(client, body, req, false);
    }
    catch (error) {
      return 'error';
    }
  }


  @UseGuards(JwtAuthGuard, twofaGuard)
  @SubscribeMessage('play-game')
  async PlayGame(@Req() req, @ConnectedSocket() client, @MessageBody() body) {
    try {
      await this.gameService.playGame(client, body, req);
    }
    catch (error) {
      return 'error';
    }
  }

  @UseGuards(JwtAuthGuard, twofaGuard)
  @SubscribeMessage('exit-game')
  async exitGame(@ConnectedSocket() client, @MessageBody() body, @Req() req,) {
    try {
      await this.gameService.exitGame(client, req);
    }
    catch (error) {
      return 'error';
    }
  }
} 