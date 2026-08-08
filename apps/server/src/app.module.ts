import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";

import { resolveEnvFilePath, validate } from "./config/env.validation";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnvFilePath(),
      validate,
    }),
    DatabaseModule,
    AuthModule,
  ],
})
export class AppModule { }
