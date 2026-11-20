import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
    @IsString()
    @IsNotEmpty()
    serviceId: string;

    @IsString()
    @IsNotEmpty()
    date: string;

    @IsString()
    @IsNotEmpty()
    timeSlot: string;

    @IsString()
    @IsNotEmpty()
    customerName: string;
}