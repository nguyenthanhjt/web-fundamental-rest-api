import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateReviewDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  authorName?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  comment?: string;
}
