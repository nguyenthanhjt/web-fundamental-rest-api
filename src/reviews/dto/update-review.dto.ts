/** Request payload for full review replacement (PUT). */
export interface UpdateReviewDto {
  authorName: string;
  rating: number;
  comment: string;
}
