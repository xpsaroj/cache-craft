import "reflect-metadata";

import { Logger, ValidationPipe, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";
import { ApiExceptionFilter, formatValidationErrors } from './common/filters/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap")

  if (configService.get<string>("NODE_ENV") === "production") {
    // The prod reverse proxy requires trusting the first hop for correct client IP detection.
    app.set("trust proxy", 1);
  }

  const allowedOrigins = configService
    .getOrThrow<string>("ALLOWED_ORIGINS")
    .split(",")
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.setGlobalPrefix("api")

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: 'Validation failed.',
          errors: formatValidationErrors(errors),
        }),
    }),
  );

  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
  );

  app.useGlobalFilters(new ApiExceptionFilter());

  app.enableShutdownHooks();

  const port = configService.getOrThrow<number>("PORT");
  await app.listen(port);

  logger.log(`Server running on port: ${port}`);
  logger.log(`Environment: ${configService.get<string>("NODE_ENV")}`);
}

bootstrap();
