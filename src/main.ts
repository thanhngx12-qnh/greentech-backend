// File: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter'; // <-- THÊM

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Bật Validation Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2. Bật Global Exception Filter để chuẩn hóa lỗi (Cực kỳ quan trọng)
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
