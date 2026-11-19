import { MaxLength } from 'class-validator';

import {
  IsString,IsNotEmpty,IsInt,Min,Max, Matches, ValidateIf,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'authorName cannot be blank',
  })
  @MaxLength(100)
  authorName!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
