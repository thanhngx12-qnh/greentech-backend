// File: src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống nội bộ';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();

      // Xử lý Validation Error (class-validator)
      if (Array.isArray(res.message)) {
        message = res.message[0]; // Lấy lỗi đầu tiên để hiển thị cho gọn
        errorCode = 'VALIDATION_ERROR';
      } else {
        message = res.message || exception.message;
        // Bắt custom errorCode nếu chúng ta chủ động gửi vào
        errorCode = res.errorCode || 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof Error) {
      // Bắt các lỗi từ Prisma Database
      const prismaError = exception as any;
      if (prismaError.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Không tìm thấy dữ liệu tương ứng';
        errorCode = 'RECORD_NOT_FOUND';
      } else if (prismaError.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Dữ liệu đã tồn tại (Bị trùng lặp)';
        errorCode = 'DUPLICATE_DATA';
      } else {
        message = exception.message;
      }
    }

    // Luôn trả về format chuẩn cho Frontend
    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode: errorCode,
      message: message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
