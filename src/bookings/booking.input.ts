import { IsDateString, IsString, Matches, MaxLength } from 'class-validator';

export class BookingInput {
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  serviceId!: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  timeSlot!: string;

  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  customerName!: string;
}
