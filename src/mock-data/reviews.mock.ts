import { Review } from '../reviews/entities/review.entity';

export const reviewsMock: Review[] = [
  { id: 1, userId: 2, serviceId: 1, rating: 5, comment: 'Good service' },
  { id: 2, userId: 2, serviceId: 1, rating: 4, comment: 'Very good' },
  { id: 3, userId: 2, serviceId: 2, rating: 3, comment: 'Average' },
];
