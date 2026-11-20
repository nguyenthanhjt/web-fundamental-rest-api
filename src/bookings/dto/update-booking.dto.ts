import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class UpdateBookingDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  serviceId?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  date?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  timeSlot?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  customerName?: string;
}
