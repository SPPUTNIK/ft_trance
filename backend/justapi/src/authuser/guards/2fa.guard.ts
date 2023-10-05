import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class twofaGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext,): Promise<boolean> {

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
      const user = await this.prisma.user?.findFirst({where: {id: req.user.id}})
      if (req.user.istwofa == false && user?.is2FAEnabled == true){
        res.send(false)
        return false;
      }
      return true;
  }
}

// i should add two endpoint /search  && /friend like insta