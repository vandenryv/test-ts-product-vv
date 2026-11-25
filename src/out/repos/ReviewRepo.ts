import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Prisma, PrismaClient } from '#src/generated/prisma/client.ts';








export default function ReviewRepo(prisma: PrismaClient) {
  return {
    getOne: (id: string) => prisma.review.findUnique({ where: { id }, include: { author: true } }),
    getPage: (pageable: Pageable) =>
      prisma.review.findMany({
        skip: pageable.page * pageable.size,
        take: pageable.size,
        include: { author: true },
      }),
    addOne: (data: Prisma.ReviewCreateInput) => prisma.review.create({ data, include: { author: true } }),
  } as const;
}