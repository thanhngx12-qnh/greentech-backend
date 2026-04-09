// File: src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module'; // Thêm
import { AuthModule } from './modules/auth/auth.module'; // Thêm

@Module({
  imports: [PrismaModule, UsersModule, AuthModule], // Thêm 2 cái này
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
