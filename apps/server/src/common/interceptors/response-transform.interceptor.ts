import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseTransformInterceptor<T>
    implements NestInterceptor<T, { success: true; data: unknown; message?: string }> {
    intercept(
        _context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<{ success: true; data: unknown; message?: string }> {
        return next.handle().pipe(
            map((result) => {
                if (
                    result !== null &&
                    typeof result === 'object' &&
                    'data' in result &&
                    'message' in result
                ) {
                    return {
                        success: true as const,
                        data: result.data,
                        message: result.message as string,
                    };
                }

                return {
                    success: true as const,
                    data: result,
                };
            }),
        );
    }
}