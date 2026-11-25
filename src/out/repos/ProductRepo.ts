import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Prisma, PrismaClient } from '#src/generated/prisma/client.ts';

export default function ProductRepo(prisma: PrismaClient) {
  return {
    getOne: (id: string) => prisma.product.findUnique({ where: { id }, include: { reviews: { include: { author: true } } } }),
    getPage: (pageable: Pageable) =>
      prisma.product.findMany({
        skip: pageable.page * pageable.size,
        take: pageable.size,
        include: { reviews: { include: { author: true } } },
      }),
    addOne: (data: Prisma.ProductCreateInput) =>
      prisma.product.create({ data, include: { reviews: { include: { author: true } } } }),
  } as const;
}