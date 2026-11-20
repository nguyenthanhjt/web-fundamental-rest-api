// dto/replace-review.dto.ts
import { IsNumber, IsString, Max, Min } from 'class-validator';

export class ReplaceReviewDto {
  @IsNumber({}, { message: 'rating must be a number from 1 to 5' })
  @Min(1, { message: 'rating must be a number from 1 to 5' })
  @Max(5, { message: 'rating must be a number from 1 to 5' })
  rating!: number;

  @IsString({ message: 'comment must be a string' })
  comment!: string;
}
