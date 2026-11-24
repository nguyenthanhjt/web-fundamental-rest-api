import { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './common/http-exception.filter.js';

/** Applies shared HTTP application configuration for runtime and e2e tests. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
}
