import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ServicesModule } from './services/services.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './database/db.config.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import { authConfig } from './auth/auth.config.js';

@Module({
  imports: [
    ServicesModule,
    BookingsModule,
    ReviewsModule,
    TypeOrmModule.forRoot({ ...dbConfig, logging: true, autoLoadEntities: true }),
    AuthenticationModule.forRoot({
      accessToken: {
        key: authConfig.jwtSecret || 'super-secret-key-with-at-least-32-characters-length',
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
