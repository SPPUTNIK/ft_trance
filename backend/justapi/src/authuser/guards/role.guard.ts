import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext,): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = await this.prisma.user.findFirst({where: {id: req.user.id}})

    if (user.signup == false){
      return false;
    }
    return true;
  }
}
