import cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './core/filters/exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('RSSence')
    .setDescription('API documentation for RSSence')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: '*',
    methods: 'GET, POST, PUT, PATCH, DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
