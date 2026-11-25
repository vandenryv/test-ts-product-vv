import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Prisma, PrismaClient } from '#src/generated/prisma/client.ts';

export type ReviewWithAuthor = Prisma.ReviewGetPayload<{ include: { author: true } }>;

export default class ReviewRepo {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  getOne(id: string): Promise<ReviewWithAuthor | null> {
    return this.prisma.review.findUnique({ where: { id }, include: { author: true } });
  }

  getPage(pageable: Pageable): Promise<ReviewWithAuthor[]> {
    return this.prisma.review.findMany({
      skip: pageable.page * pageable.size,
      take: pageable.size,
      include: { author: true },
    });
  }

  addOne(data: Prisma.ReviewCreateInput): Promise<ReviewWithAuthor> {
    return this.prisma.review.create({ data, include: { author: true } });
  }
}