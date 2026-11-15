/** Request payload for creating a review. */
export interface CreateReviewDto {
  authorName: string;
  rating: number;
  comment?: string;
}
