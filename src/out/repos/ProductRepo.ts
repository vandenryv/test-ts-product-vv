import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Prisma, PrismaClient } from '#src/generated/prisma/client.ts';

export type ProductWithReviews = Prisma.ProductGetPayload<{ include: { reviews: { include: { author: true } } } }>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ProductBare = Prisma.ProductGetPayload<{ }>;

export default class ProductRepo {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getOne(id: string): Promise<ProductWithReviews | null> {
    return this.prisma.product.findUnique({ where: { id }, include: { reviews: { include: { author: true } } } });
  }

  async getPage(pageable: Pageable): Promise<ProductBare[]> {
    return this.prisma.product.findMany({
      skip: (pageable.page - 1)  * pageable.size,
      take: pageable.size,
      orderBy: { id: 'asc' }
    });
  }

  async addOne(data: Prisma.ProductCreateInput): Promise<ProductWithReviews> {
    return this.prisma.product.create({ data, include: { reviews: { include: { author: true } } } });
  }

  async findOneByReference(reference: string): Promise<ProductWithReviews | null> {
    return this.prisma.product.findUnique({ where: { reference }, include: { reviews: { include: { author: true } } } });
  }

  async count(): Promise<number> {
    return this.prisma.product.count();
  }

  async findTopPositive(limit :number ): Promise<ProductWithReviews[]> {
    const counts = await this.prisma.review.groupBy({
      by: ['productId'],
      where: { notation: { gt: 3 } },
      _count: { productId: true },
      orderBy: [{ _count: { productId: 'desc' } }, { productId: 'asc' }],
      take: limit,
    });

    const topProductIds = counts.map(({ productId }) => productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: topProductIds} },
      include: { reviews: { include: { author: true } } },
    });

    const productMap = new Map(products.map(product => [product.id, product]));
    const productInOrder = counts
      .map(({ productId }) => productMap.get(productId))
      .filter(value => value !== undefined);
    return productInOrder;
  }

  async findLowestRated(limit: number): Promise<ProductWithReviews[]> {
    const ratings = await this.prisma.review.groupBy({
      by: ['productId'],
      _avg: { notation: true },
      orderBy: [{ _avg: { notation: 'asc' } }, { productId: 'asc' }],
      take: limit,
    });

    const worstProductIds = ratings.map(({ productId }) => productId)

    const products = await this.prisma.product.findMany({
      where: { id: { in:worstProductIds } },
      include: { reviews: { include: { author: true } } },
    });

    const productMap = new Map(products.map(product => [product.id, product]));

    const productInOrder = ratings
      .map(({ productId }) => productMap.get(productId))
      .filter(value => value !== undefined);
    return productInOrder;
  }


}