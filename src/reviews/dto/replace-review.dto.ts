import { MaxLength } from 'class-validator';
import {IsString,IsNotEmpty,IsInt,Min,Max,Matches,} from 'class-validator';

export class ReplaceReviewDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(100)
  authorName!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MaxLength(2000)
  comment!: string;
}