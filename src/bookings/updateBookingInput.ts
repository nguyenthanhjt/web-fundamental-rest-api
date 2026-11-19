import { IsDateString, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class UpdateBookingInput {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  serviceId?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  timeSlot?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(/\S/)
  @MaxLength(100)
  customerName?: string;
}
