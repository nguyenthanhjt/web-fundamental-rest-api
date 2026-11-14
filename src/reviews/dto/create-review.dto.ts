
import {
  IsString,IsNotEmpty,IsNumber,Min,Max, Matches, ValidateIf,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'authorName cannot be blank',
  })
  authorName!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  comment?: string;
}
