import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
//import * as csurf from 'csurf';

export const MyIp = process.env.MyIp;
export const portFront = process.env.portFront;
export const Myport : number = parseInt(process.env.Myport);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const option = {origin: true,
    credentials: true,
  }

  // app.use(helmet()); 
  app.enableCors(option);
  app.use(cookieParser());
  //app.use(csurf());

  await app.listen(Myport);
}
bootstrap();
