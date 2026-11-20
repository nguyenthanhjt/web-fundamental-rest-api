// bookings/bookings.module.ts
import { Module } from "@nestjs/common";
import { ServicesModule } from "../services/services.module";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";

@Module({
  imports: [ServicesModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}