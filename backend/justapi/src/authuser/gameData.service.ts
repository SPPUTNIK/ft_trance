import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GameDataService {
    constructor(private prisma: PrismaService) { }
    async getNotifications(req, res) { /// update done
        const listnot = await this.prisma.notification.findMany({ where: { myid: req.user.id } });
        return res.send(listnot);
    }
}