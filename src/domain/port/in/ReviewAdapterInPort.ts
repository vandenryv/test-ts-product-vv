import type { Review } from '#src/domain/models/Review.ts';
import type { Pageable } from '#src/common/classes/Pageable.ts';

export interface ReviewAdapterInPort {
  findOneById: (id: string) => Promise<Review>;
  getPage:  (pageable: Pageable)  => Promise<Review[]>;
  findByProductId: (productId: string) => Promise<Review[]>;
  getTotalNumberOfReviews: () => Promise<number>;
}