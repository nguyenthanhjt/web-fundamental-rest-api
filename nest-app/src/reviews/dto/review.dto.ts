import {
  IsNumber,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export interface Review {
  id: string;
  serviceId: string;
  authorName: string;
  rating: number;
  comment: string;
}

export class CreateReviewDto {
  @IsString({ message: 'Tên tác giả phải là chuỗi' })
  @Matches(/\S/, { message: 'Tên tác giả không được để trống' })
  authorName!: string;

  @IsNumber({}, { message: 'Điểm đánh giá phải là số' })
  @Min(1, { message: 'Điểm đánh giá tối thiểu là 1' })
  @Max(5, { message: 'Điểm đánh giá tối đa là 5' })
  rating!: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ message: 'Nhận xét phải là chuỗi' })
  comment?: string;
}

// PATCH: chỉ gửi các trường cần cập nhật.
export class UpdateReviewDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ message: 'Tên tác giả phải là chuỗi' })
  @Matches(/\S/, { message: 'Tên tác giả không được để trống' })
  authorName?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsNumber({}, { message: 'Điểm đánh giá phải là số' })
  @Min(1, { message: 'Điểm đánh giá tối thiểu là 1' })
  @Max(5, { message: 'Điểm đánh giá tối đa là 5' })
  rating?: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ message: 'Nhận xét phải là chuỗi' })
  comment?: string;
}
