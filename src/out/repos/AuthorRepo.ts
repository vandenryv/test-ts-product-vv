import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Prisma, PrismaClient } from '#src/generated/prisma/client.ts';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type StoredAuthor = Prisma.AuthorGetPayload<{}>;

export default class AuthorRepo {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getOne(id: string): Promise<StoredAuthor | null> {
    return this.prisma.author.findUnique({ where: { id } });
  }

  async getPage(pageable: Pageable): Promise<StoredAuthor[]> {
    return this.prisma.author.findMany({
      skip: pageable.page * pageable.size,
      take: pageable.size,
    });
  }

  async addOne(data: Prisma.AuthorCreateInput): Promise<StoredAuthor> {
    return this.prisma.author.create({ data });
  }
}