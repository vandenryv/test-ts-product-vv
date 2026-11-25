import type { Review, ReviewToAdd } from '#src/domain/models/Review.ts';
import type { Pageable } from '#src/common/classes/Pageable.ts';

export interface ReviewAdapterOutPort {
  findOneById: (id: string) => Promise<Review>;
  getPage:  (pageable: Pageable)  => Promise<Review[]>;
}