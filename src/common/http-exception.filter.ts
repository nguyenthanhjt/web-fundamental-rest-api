import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

/** Formats NestJS HttpExceptions into `{ message }` to match the Express error shape. */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const rawMessage = (exceptionResponse as { message: unknown }).message;
      if (Array.isArray(rawMessage)) {
        message = rawMessage.join(', ');
      } else if (typeof rawMessage === 'string') {
        message = rawMessage;
      }
    }

    response.status(status).json({ message });
  }
}
