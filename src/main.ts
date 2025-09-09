import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from './modules/socket/adapters/socket-io.adapter';
import helmet from 'helmet';
import { AllExceptionsFilter, ResponseInterceptor } from './common/filters';
import WsExceptionFilter from './common/filters/ws-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Socket
  const configService = app.get(ConfigService);
  app.useWebSocketAdapter(new SocketIoAdapter(configService));

  /**
   * Swagger config start
   **/
  const config = new DocumentBuilder()
    .setTitle(String(configService.get('SWAGGER_TITLE')))
    .setDescription(String(configService.get('SWAGGER_DESCRIPTION')))
    .setVersion(String(configService.get('SWAGGER_VERSION')))
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter your token directly (with "Bearer " prefix)',
      },
      'bare-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-client-id',
        in: 'header',
        description: 'Custom header for requests',
      },
      'x-client-id',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  /*
     Swagger config end
  */

  // CORS
  app.enableCors({
    credentials: true,
    origin: String(configService.get('CORS_ORIGIN')),
  });

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
