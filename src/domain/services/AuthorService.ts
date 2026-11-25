import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { AuthorAdapterInPort } from '#src/domain/port/in/AuthorAdapterInPort.ts';
import type { Author } from '#src/domain/types/Author.ts';

export class AuthorService implements AuthorAdapterInPort{

  authorRepo: AuthorAdapterInPort;

  constructor(authorAdapterPortOut: AuthorAdapterInPort) {
    this.authorRepo = authorAdapterPortOut;
  }

  addOne(author: Author): Promise<Author> {
    return this.authorRepo.addOne(author);
  }

  findOneById(id: string): Promise<Author> {
    return this.authorRepo.findOneById(id);
  }

  getPage(pageable: Pageable): Promise<Author[]> {
    return this.authorRepo.getPage(pageable);
  }

}