import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { twofaGuard } from './guards/2fa.guard';
import { GameDataService } from './gameData.service';


@Controller('game/temp')
export class DataGameController {
  constructor(private readonly gameService: GameDataService) { }

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

}