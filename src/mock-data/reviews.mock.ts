import { Review } from '../reviews/entities/review.entity';

export const reviewsMock: Review[] = [
  {
    id: 'rev_001',
    userId: 'usr_002',
    serviceId: 'svc_001',
    rating: 5,
    comment: 'Good service',
  },
  {
    id: 'rev_002',
    userId: 'usr_002',
    serviceId: 'svc_001',
    rating: 4,
    comment: 'Very good',
  },
  {
    id: 'rev_003',
    userId: 'usr_002',
    serviceId: 'svc_002',
    rating: 3,
    comment: 'Average',
  },
];
