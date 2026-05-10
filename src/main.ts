// File: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // <-- THÊM IMPORT

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

  // 2. Chuẩn hóa Output Thành công (Response)
  app.useGlobalInterceptors(new TransformInterceptor());

  // 3. Bật Global Exception Filter để chuẩn hóa lỗi
  app.useGlobalFilters(new AllExceptionsFilter());

  // 🎯 4. THIẾT LẬP SWAGGER (Tài liệu API Tự động)
  const config = new DocumentBuilder()
    .setTitle('Greentech Analysis B2B API')
    .setDescription(
      'Hệ thống API dành cho Website B2B: News, Services, Leads, Careers, Sliders.',
    )
    .setVersion('1.0')
    .addBearerAuth() // Kích hoạt nút điền JWT Token trên UI Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Truy cập tại: http://localhost:3000/api/docs
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ lại Token sau khi người dùng F5 trang
    },
  });

  // 5. Khởi chạy Server
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`\n🚀 Application is running on: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs\n`);
}
bootstrap();
