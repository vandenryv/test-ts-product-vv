import type { Pageable } from '#src/common/classes/Pageable.ts';
import { NotFoundError } from '#src/common/classes/route-errors.ts';
import type ReviewAdapterOutPort from '#src/domain/port/out/ReviewAdapterOutPort.ts';
import type { Review } from '#src/domain/types/Review.ts';
import type { PrismaClient } from '#src/generated/prisma/client.ts';
import ReviewRepo from '#src/out/repos/ReviewRepo.ts';

export class ReviewAdapter implements ReviewAdapterOutPort {
  private readonly reviewRepo: ReturnType<typeof ReviewRepo>;

  constructor(prisma: PrismaClient) {
    this.reviewRepo = ReviewRepo(prisma);
  }

  async findOneById(id: string): Promise<Review> {
    const review = await this.reviewRepo.getOne(id);
    if (!review) throw new NotFoundError(`Review not found: ${id}`);
    return review;
  }

  getPage(pageable: Pageable): Promise<Review[]> {
    return this.reviewRepo.getPage(pageable);
  }

  addOne(review: Review): Promise<Review> {
    const { authorId, productId, author, ...data } = review;
    return this.reviewRepo.addOne({
      ...data,
      author: { connect: { id: authorId } },
      product: { connect: { id: productId } },
    });
  }
}