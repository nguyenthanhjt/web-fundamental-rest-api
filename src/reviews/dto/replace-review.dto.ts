import {IsString,IsNotEmpty,IsNumber,Min,Max,Matches,} from 'class-validator';

export class ReplaceReviewDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  authorName!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  comment!: string;
}