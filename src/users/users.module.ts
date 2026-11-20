import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { InMemoryRefreshTokenStore } from '../auth/refresh-token/in-memory-refresh-token.store';
import { REFRESH_TOKEN_STORE } from '../auth/refresh-token/refresh-token.store';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: REFRESH_TOKEN_STORE,
      useClass: InMemoryRefreshTokenStore,
    },
  ],
  exports: [UsersService, REFRESH_TOKEN_STORE],
})
export class UsersModule {}
