import type { Author, AuthorToAdd } from '#src/domain/models/Author.ts';
import type { Pageable } from '#src/common/classes/Pageable.ts';

export interface AuthorAdapterOutPort {
  findOneById: (id: string) => Promise<Author>;
  getPage:  (pageable: Pageable)  => Promise<Author[]>;
  addOne: (author: AuthorToAdd) => Promise<Author>;
}