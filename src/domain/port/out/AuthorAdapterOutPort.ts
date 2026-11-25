import type { Author } from '#src/domain/types/Author.ts';
import type { Pageable } from '#src/common/classes/Pageable.ts';

export interface AuthorAdapterOutPort {
  findOneById: (id: string) => Promise<Author>;
  getPage:  (pageable: Pageable)  => Promise<Author[]>;
  addOne: (author: Author) => Promise<Author>;
}