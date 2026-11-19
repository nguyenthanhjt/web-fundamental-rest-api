import { MaxLength } from 'class-validator';

import {IsString,IsNotEmpty,IsInt,Min, Max,Matches,ValidateIf,
} from 'class-validator';

export class UpdateReviewDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(100)
  authorName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
