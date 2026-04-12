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

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = res.message || exception.message;
      errorCode = res.errorCode || 'HTTP_EXCEPTION';
    } else if (exception instanceof Error) {
      // Catch các lỗi lạ không phải HttpException
      message = (exception as Error).message;
      // Ở đây có thể thêm logic để map các lỗi Prisma cụ thể sang errorCode
      if ((exception as any).code === 'P2025') {
        errorCode = 'RECORD_NOT_FOUND';
      }
    }

    response.status(status).json({
      statusCode: status,
      errorCode: errorCode,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
