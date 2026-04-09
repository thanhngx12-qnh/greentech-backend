// File: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- Thêm dòng này

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật ValidationPipe để NestJS tự động kiểm tra DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các trường không khai báo trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu client gửi dư trường
      transform: true, // Tự động convert kiểu dữ liệu (VD: string -> number)
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
