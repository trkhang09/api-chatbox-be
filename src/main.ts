import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from './modules/socket/adapters/socket-io.adapter';
import helmet from 'helmet';
import { AllExceptionsFilter, ResponseInterceptor } from './common/filters';
import WsExceptionFilter from './common/filters/ws-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Socket
  const configService = app.get(ConfigService);
  app.useWebSocketAdapter(new SocketIoAdapter(configService));

  // CORS
  app.enableCors({ credentials: true, origin: '*' });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // GLobal prefix
  app.setGlobalPrefix('api');

  // HTTP Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalFilters(new WsExceptionFilter());

  // Global interceptor for response successfull
  app.useGlobalInterceptors(new ResponseInterceptor());

  // helmet
  app.use(helmet());

  await app.listen(Number(process.env.APP_PORT));
}

bootstrap();
