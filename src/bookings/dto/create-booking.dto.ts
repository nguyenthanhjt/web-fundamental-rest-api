import { IsDateString, IsMilitaryTime, IsString } from "class-validator";

export class CreateBookingDto 
{   
    @IsString()
    serviceId: string;
    @IsDateString()
    date: string;
    @IsMilitaryTime()
    timeSlot: string;
    @IsString()
    customerName: string;
}
