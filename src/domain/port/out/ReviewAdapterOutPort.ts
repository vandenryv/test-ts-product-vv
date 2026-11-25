import type { Review } from '#src/domain/types/Review.ts';
import type { Pageable } from '#src/common/classes/Pageable.ts';

export default interface ReviewAdapterOutPort {
  findOneById: (id: string) => Promise<Review>;
  getPage:  (pageable: Pageable)  => Promise<Review[]>;
  addOne: (data: Review) => Promise<Review>;
}