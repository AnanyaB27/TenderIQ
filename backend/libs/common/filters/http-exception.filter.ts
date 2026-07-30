import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

/**
 * Produces the uniform `{ error: { code, message, details, correlationId } }`
 * envelope (API_SPEC.md §3.2, §13). Error-code mapping is implemented in a
 * later phase.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: exception.message,
        correlationId: undefined,
      },
    });
  }
}
