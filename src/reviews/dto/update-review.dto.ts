import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto.js';

export class UpdateReviewDto extends CreateReviewDto  { }

export class PatchReviewDto extends PartialType(CreateReviewDto) {}
