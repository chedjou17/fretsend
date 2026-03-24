import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Enveloppe toutes les réponses réussies dans un format standard :
 * {
 *   "success": true,
 *   "data": <réponse du contrôleur>,
 *   "timestamp": "2025-03-15T10:00:00.000Z"
 * }
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success:   true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
