import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from './modules/socket/adapters/socket-io.adapter';
import { ResponseInterceptor } from './common/filters/http-response';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { WsExceptionFilter } from './common/filters/ws-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Socket
  const configService = app.get(ConfigService);
  app.useWebSocketAdapter(new SocketIoAdapter(configService));

  app.enableCors({ credentials: true, origin: '*' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  // HTTP Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalFilters(new WsExceptionFilter());

  // Global interceptor for response successfull
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
