import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const payload = exception.getResponse();
    let message = exception.message;

    if (typeof payload === 'string') {
      message = payload;
    } else if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const errorMessage = payload.message;
      if (Array.isArray(errorMessage)) {
        message = errorMessage.join(', ');
      } else if (typeof errorMessage === 'string') {
        message = errorMessage;
      }
    }

    response.status(exception.getStatus()).json({ message });
  }
}
