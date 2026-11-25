import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { ReviewAdapterInPort } from '#src/domain/port/in/ReviewAdapterInPort.ts';
import type { Review } from '#src/domain/models/Review.ts';
import type { ReviewAdapterOutPort } from '#src/domain/port/out/ReviewAdapterOutPort.ts';

export class ReviewService implements ReviewAdapterInPort {
  reviewRepo: ReviewAdapterOutPort;

  constructor(reviewPortOut: ReviewAdapterOutPort) {
    this.reviewRepo = reviewPortOut;
  }

  findOneById(id: string): Promise<Review> {
    return this.reviewRepo.findOneById(id);
  }

  getPage(pageable: Pageable): Promise<Review[]> {
    return this.reviewRepo.getPage(pageable);
  }

  findByProductId(productId: string): Promise<Review[]> {
    return this.reviewRepo.findByProductId(productId);
  }

  getTotalNumberOfReviews(): Promise<number> {
    return this.reviewRepo.getTotalNumberOfReviews();
  }
}