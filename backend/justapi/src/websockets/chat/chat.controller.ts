import { Controller, Get, UseGuards, Req, Res, Post, Param, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../authuser/jwt.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { TwoFactorAuthenticationService } from '../../2fa/two-factor-auth.service';
import { twofaGuard } from '../../authuser/guards/2fa.guard';

@Controller('auth-user')
export class ChatController {
  constructor(private readonly ChatService: ChatService, private prisma: PrismaService, private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService) { }


  @UseGuards(JwtAuthGuard, twofaGuard)
@Get('/chat/users')
async getLastChats(@Req() req, @Res() res) {
  return await this.ChatService.getLastChats(req, res)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Get('/userstatus')
async getUserStatus( @Res() res, @Req() req) {
  return await this.ChatService.getUserStatus(res, req.user.id)
}


@UseGuards(JwtAuthGuard, twofaGuard)
@Get('/chat/groups')
async getLastGroups(@Req() req, @Res() res) {
  return await this.ChatService.getLastGroups(req, res)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Get('/chat/user/:id')
async getchatDM(@Req() req, @Res() res, @Param('id') id) {
  return await this.ChatService.getchatDM(req, res, id)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Get('/chat/allrooms')
async getAllRooms(@Req() req, @Res() res, @Body() body) {
  return await this.ChatService.getAllRooms(req, res, body)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Get('/chat/group/:id')
async getchatGroup(@Req() req, @Res() res, @Param('id') id) {
  return await this.ChatService.getchatGroup(req, res, id)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Get('/chat/group/membres/:id')
async getMembres(@Req() req, @Res() res, @Body() body, @Param('id') id) {
  return await this.ChatService.getMembres(req, res, body, id)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Get('/chat/group/allusers/:id')
async getalltoadd(@Req() req, @Res() res, @Param('id') id) {
  return await this.ChatService.getalltoadd(req, res, id)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Post('/chat/group/updateRole')
async updateFriendRole(@Req() req, @Res() res, @Body() body) {
  await this.ChatService.updateFriendRole(req, res, body)
  return res.send({message: 'update Role'})
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Post('/chat/group/membermute/')
async muteMemeber(@Req() req, @Res() res, @Body() body) {
  return await this.ChatService.muteMemeber(req, res, body)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Post('/chat/group/memberunmute')
async unmuteMemeber(@Req() req, @Res() res, @Body() body) {
  return await this.ChatService.unmuteMemeber(req, res, body)
}

@UseGuards(JwtAuthGuard, twofaGuard)
@Post('/chat/group/changeType')
async changeRoomType(@Req() req, @Res() res, @Body() body) {
  return await this.ChatService.changeRoomType(req, res, body)
}
}