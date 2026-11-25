import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { ReviewAdapterInPort } from '#src/domain/port/in/ReviewAdapterInPort.ts';
import type { Review, ReviewToAdd } from '#src/domain/models/Review.ts';
import type { ReviewAdapterOutPort } from '#src/domain/port/out/ReviewAdapterOutPort.ts';

export class ReviewService implements ReviewAdapterInPort {
  reviewRepo: ReviewAdapterOutPort;

  constructor(reviewPortOut: ReviewAdapterOutPort) {
    this.reviewRepo = reviewPortOut;
  }

  addOne(review: ReviewToAdd): Promise<Review> {
    return this.reviewRepo.addOne(review);
  }

  findOneById(id: string): Promise<Review> {
    return this.reviewRepo.findOneById(id);
  }

  getPage(pageable: Pageable): Promise<Review[]> {
    return this.reviewRepo.getPage(pageable);
  }
}