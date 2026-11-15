import { CreateBookingDto } from './create-booking.dto.js';

/** Request payload for partial booking update (PATCH). */
export type PatchBookingDto = Partial<CreateBookingDto>;
