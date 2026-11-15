import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class ReplaceReviewDto {
  @IsString()
  @IsNotEmpty()
  authorName!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  comment!: string;
}
