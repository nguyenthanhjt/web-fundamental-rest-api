
import {IsString,IsNotEmpty,IsNumber,Min, Max,Matches,ValidateIf,
} from 'class-validator';

export class UpdateReviewDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  authorName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  comment?: string;
}
