import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Prisma, PrismaClient } from '#src/generated/prisma/client.ts';

export type ProductWithReviews = Prisma.ProductGetPayload<{ include: { reviews: { include: { author: true } } } }>;

export default class ProductRepo {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getOne(id: string): Promise<ProductWithReviews | null> {
    return this.prisma.product.findUnique({ where: { id }, include: { reviews: { include: { author: true } } } });
  }

  async getPage(pageable: Pageable): Promise<ProductWithReviews[]> {
    return this.prisma.product.findMany({
      skip: pageable.page * pageable.size,
      take: pageable.size,
      include: { reviews: { include: { author: true } } },
    });
  }

  async addOne(data: Prisma.ProductCreateInput): Promise<ProductWithReviews> {
    return this.prisma.product.create({ data, include: { reviews: { include: { author: true } } } });
  }
}