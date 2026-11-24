/** Request payload for creating a review. */
export interface CreateReviewDto {
  rating: number;
  comment?: string;
}
