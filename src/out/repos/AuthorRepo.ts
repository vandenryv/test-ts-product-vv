import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Prisma, PrismaClient } from '#src/generated/prisma/client.ts';

export default function AuthorRepo(prisma: PrismaClient) {
  return {
    getOne: (id: string) => prisma.author.findUnique({ where: { id } }),
    getPage: (pageable: Pageable) =>
      prisma.author.findMany({
        skip: pageable.page * pageable.size,
        take: pageable.size,
      }),
    addOne: (data: Prisma.AuthorCreateInput) => prisma.author.create({ data }),
  } as const;
}