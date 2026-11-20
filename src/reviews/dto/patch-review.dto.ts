import { UpdateReviewDto } from './update-review.dto.js';

/** Request payload for partial review update (PATCH). */
export type PatchReviewDto = Partial<UpdateReviewDto>;
