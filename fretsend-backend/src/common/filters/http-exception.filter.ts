import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Intercepte toutes les exceptions et retourne une réponse JSON standardisée.
 *
 * Format d'erreur :
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "error": "Bad Request",
 *   "message": ["Le champ email est requis"],
 *   "timestamp": "2025-03-15T10:00:00.000Z",
 *   "path": "/api/v1/packages"
 * }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erreur interne du serveur';
    let error   = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error   = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, any>;
        message    = body.message || message;
        error      = body.error   || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Ne logger les erreurs 5xx que (pas les 4xx qui sont normales)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success:    false,
      statusCode: status,
      error,
      message:    Array.isArray(message) ? message : [message],
      timestamp:  new Date().toISOString(),
      path:       request.url,
    });
  }
}
