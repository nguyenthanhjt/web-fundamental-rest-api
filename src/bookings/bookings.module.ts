import { Module } from "@nestjs/common";
import { ServicesModule } from "../services/services.module";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { BookingsRepository } from "./bookings.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./entities/booking.entity";
import { BookingPolicy } from "./bookings.policy";

@Module({
  imports: [ServicesModule, TypeOrmModule.forFeature([Booking])],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepository, BookingPolicy],
})
export class BookingsModule {}
