import { Controller, Get, UseGuards, Req, Res, Post, Param, Body, UseInterceptors, UploadedFile, HttpCode, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthuserService } from './authuser.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomStorage } from './just';
import { RoleGuard } from './guards/role.guard';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwoFactorAuthenticationService } from 'src/2fa/two-factor-auth.service';
import { twofaGuard } from './guards/2fa.guard';

//curl http://localhost:3000/auth-user/authenticate --cookie 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkwMjk0IiwiZW1haWwiOiJoYWxhcW9oQHN0dWRlbnQuMTMzNy5tYSIsImlhdCI6MTY5MTM2ODc1Mn0.Z5bsF5Warit8o43h8gDwofSN5wQEUgM33b4uX7q5hrc' -X POST -d twoFactorAuthenticationCode=""

@Controller('auth-user')
export class AuthuserController {
  constructor(private readonly authuserService: AuthuserService, private prisma: PrismaService, private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService) { }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(@Req() req, @Body() { twoFactorAuthenticationCode }, @Res() res) {
    const founduser = await this.prisma.user.findFirst({ where: { id: req.user.id } })
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(founduser.twoFactorAuthenticationSecret, twoFactorAuthenticationCode);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code 2fa 2fa');
    }
    // set new cookie with 2fa true
    const token = await this.authuserService.signJWToken({ id: req.user.id, email: req.user.email, istwofa: true })
    if (!token) {
      throw new ForbiddenException();
    }
    res.cookie("token", token);

    return await this.authuserService.getuser(req.user, res)
  }

  @Get('generate')
  @UseGuards(JwtAuthGuard, twofaGuard)
  async register(@Res() res, @Req() req) {
    const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(req);

    return res.send(otpauthUrl)
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, twofaGuard)
  async turnOnTwoFactorAuthentication(@Req() req, @Body() { twoFactorAuthenticationCode }) {
    const founduser = await this.prisma.user.findFirst({ where: { id: req.user.id } })
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(founduser.twoFactorAuthenticationSecret, twoFactorAuthenticationCode);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code 2fa');
    }
    await this.authuserService.turnOnTwoFactorAuthentication(req.user.id);
    return { message: 'enable 2fa successefuly' }
  }

  @Post('turn-off')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, twofaGuard)
  async turnOffTwoFactorAuthentication(@Req() req, @Body() { twoFactorAuthenticationCode }) {
    const founduser = await this.prisma.user.findFirst({ where: { id: req.user.id } })
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(founduser.twoFactorAuthenticationSecret, twoFactorAuthenticationCode);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code 2fa');
    }
    await this.authuserService.turnOffTwoFactorAuthentication(req.user.id);
    return { message: 'desable 2fa successefuly' }
  }

  @Get('redirect')
  @UseGuards(AuthGuard('42'))
  async intra42AuthRedirect(@Req() req, @Res() res) {
    return await this.authuserService.intra42Login(req.user, res)
  }

  @UseGuards(JwtAuthGuard, twofaGuard)
  @Post('update-username')
  async updateusername(@Req() req, @Res() res, @Body() body) {
    return await this.authuserService.updateusername(req, res, body)
  }

  @Throttle(2, 5)
  @UseGuards(JwtAuthGuard, twofaGuard, twofaGuard)
  @Post('update-img')
  @UseInterceptors(FileInterceptor('img', CustomStorage))
  async uploadimage(@Req() req, @Res() res, @UploadedFile() image) {
    return await this.authuserService.uploadimage(req, res, image)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('/image/:img')
  async getimg(@Req() req, @Res() res, @Param() image) {
    return await this.authuserService.getimg(req, res, image)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('/search/:username')
  async search(@Req() req, @Res() res, @Param('username') username) {
    return await this.authuserService.search(req, res, username)
  }

  @UseGuards(JwtAuthGuard, twofaGuard)
  @Get('user')// just me
  async getuser(@Req() req, @Res() res) {
    return await this.authuserService.getuser(req.user, res)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('user/:id')// any user
  async getuserid(@Req() req, @Res() res, @Param('id') id) {
    return await this.authuserService.getuserid(req.user, res, id)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('block/:id')
  async blockusers(@Req() req, @Res() res, @Param('id') id) {
    return await this.authuserService.blockusers(req, res, id)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('blocklist')
  async blocklist(@Req() req, @Res() res) {
    return await this.authuserService.blocklist(req, res)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('unblockuser/:id')
  async unblockuser(@Req() req, @Res() res, @Param('id') id) {
    return await this.authuserService.unblockuser(req, res, id)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('users')//list alll users
  async getusers(@Req() req, @Res() res) {
    return await this.authuserService.getusers(req, res)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('signout')
  async signout(@Req() req, @Res() res) {
    return await this.authuserService.signout(req, res)
  }

  // friends controllers
  //@Get(friend)

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get("friend/:id")
  async getfriend(@Req() req, @Res() res, @Param('id') id) {
    return await this.authuserService.getfriend(req, res, id)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)//hna hna
  @Get("friendOFfriend/:id")
  async getfriendsid(@Req() req, @Res() res, @Param('id') id) {
    return await this.authuserService.getfriendsid(req, res, id)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get("following")
  async getfriends(@Req() req, @Res() res) {
    return await this.authuserService.getfriends(req, res)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get("followers")
  async getfriendsaa(@Req() req, @Res() res) {
    return await this.authuserService.getfriendsaa(req, res)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('addfriend/:id')
  async addfriend(@Req() req, @Res() res, @Param('id') id) {
    return await this.authuserService.addfriend(req, res, id)
  }

  @UseGuards(JwtAuthGuard, RoleGuard, twofaGuard)
  @Get('deletefriend/:id')
  async deletefriend(@Req() req, @Res() res, @Param('id') id) {
    return await this.authuserService.deletefriend(req, res, id)
  }
}
