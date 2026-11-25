import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { AuthorAdapterOutPort } from '#src/domain/port/out/AuthorAdapterOutPort.ts';
import type { Author } from '#src/domain/models/Author.ts';
import type { PrismaClient } from '#src/generated/prisma/client.ts';
import AuthorRepo from '#src/out/repos/AuthorRepo.ts';
import { NotFoundError } from '#src/common/classes/route-errors.ts';

export class AuthorAdapter implements AuthorAdapterOutPort {
  private readonly authorRepo: AuthorRepo;

  constructor(prisma: PrismaClient) {
    this.authorRepo = new AuthorRepo(prisma);
  }

  async findOneById(id: string): Promise<Author> {
    const author = await this.authorRepo.getOne(id);
    if (!author) throw new NotFoundError(`Author not found: ${id}`);
    return author;
  }

  getPage(pageable: Pageable): Promise<Author[]> {
    return this.authorRepo.getPage(pageable);
  }
}