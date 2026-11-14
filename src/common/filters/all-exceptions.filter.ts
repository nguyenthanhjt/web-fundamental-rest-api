
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';

import { HttpAdapterHost } from '@nestjs/core';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: string[] = [];
    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (
        errorResponse !== null &&
        typeof errorResponse === 'object' &&
        'message' in errorResponse
      ) {
        const rawMessage = errorResponse.message;

        if (Array.isArray(rawMessage)) {
          message = 'Validation failed';
          errors = rawMessage.map(String);
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        }
      }
    } else {
    
      this.logger.error(
        'Unexpected exception',
        exception instanceof Error
          ? exception.stack
          : String(exception),
      );
    }

    const responseBody = {
      success: false,
      statusCode,
      message,
      errors,
      path: httpAdapter.getRequestUrl(request),
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(response, responseBody, statusCode);
  }
}
