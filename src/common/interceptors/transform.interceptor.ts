// File: src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // Nếu Service trả về object có chứa sẵn { data, meta } (như hàm findAll)
        if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
          return {
            success: true,
            message: 'Thành công',
            data: res.data,
            meta: res.meta,
          };
        }

        // Nếu Service trả về dữ liệu trực tiếp (như findOne, create, update)
        return {
          success: true,
          message: 'Thành công',
          data: res, // Đưa toàn bộ response vào trường 'data'
        };
      }),
    );
  }
}
