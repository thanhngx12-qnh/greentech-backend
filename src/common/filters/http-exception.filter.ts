// File: src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = res.message || exception.message;
      // Nếu lỗi có kèm errorCode (do mình chủ động ném ra), lấy nó, nếu không dùng mặc định
      errorCode = res.errorCode || 'HTTP_EXCEPTION';
    } else if (exception instanceof Error) {
      message = (exception as Error).message;
      // Xử lý riêng cho các lỗi Prisma để không lộ thông tin DB
      if ((exception as any).code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Không tìm thấy dữ liệu tương ứng';
        errorCode = 'RECORD_NOT_FOUND';
      } else if ((exception as any).code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Dữ liệu đã tồn tại (Trùng lặp)';
        errorCode = 'DUPLICATE_DATA';
      }
    }

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
