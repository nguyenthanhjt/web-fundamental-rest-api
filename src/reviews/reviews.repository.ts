import { Injectable } from "@nestjs/common";
import { Review } from "./entities/review.entity.js";

@Injectable()
export class ReviewsRepository {
    private reviews: Review[] = new Array;
    
    findAll(serviceId: string): Review[] {
        return [...this.reviews.filter((value) => value.serviceId === serviceId)];
    }

    findById(id: string): Review | undefined {
        const review = this.reviews.find((review) => review.id === id);
        if (!review)
            return undefined;
        return {...review};
    }

    save(review: Review): Review {
        const existReview = this.reviews.find((r) => review.id === r.id);
        if (existReview !== undefined) {
            existReview.serviceId = review.serviceId;
            existReview.authorName = review.authorName;
            existReview.rating = review.rating;
            existReview.comment = review.comment; 
        }
        else {
            this.reviews.push(review);
        }
        return {...review};
    }

    delete(id: string) {
        const index = this.reviews.findIndex((value) => value.id === id);
        if (index !== -1)
            this.reviews.splice(index, 1);
    }
}