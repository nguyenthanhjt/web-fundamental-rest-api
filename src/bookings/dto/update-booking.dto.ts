import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto.js';
import { IsString, IsDateString, IsMilitaryTime, IsOptional } from 'class-validator';

export class UpdateBookingDto extends CreateBookingDto { }

export class PatchBookingDto extends PartialType(CreateBookingDto) { }
