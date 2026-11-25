import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { AuthorAdapterInPort } from '#src/domain/port/in/AuthorAdapterInPort.ts';
import type { Author, AuthorToAdd } from '#src/domain/models/Author.ts';

export class AuthorService implements AuthorAdapterInPort{

  authorRepo: AuthorAdapterInPort;

  constructor(authorPortOut: AuthorAdapterInPort) {
    this.authorRepo = authorPortOut;
  }

  findOneById(id: string): Promise<Author> {
    return this.authorRepo.findOneById(id);
  }

  getPage(pageable: Pageable): Promise<Author[]> {
    return this.authorRepo.getPage(pageable);
  }

}