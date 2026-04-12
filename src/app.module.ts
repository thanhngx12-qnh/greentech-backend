// File: src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MediaModule } from './modules/media/media.module'; // <-- 1. PHẢI CÓ DÒNG NÀY

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    MediaModule, // <-- 2. PHẢI CÓ DÒNG NÀY
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
