import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  authorName!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  comment?: string;
}
