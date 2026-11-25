import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Author, AuthorToAdd } from '#src/domain/models/Author.ts';

export interface AuthorAdapterInPort {
  findOneById: (id: string) => Promise<Author>;
  getPage: (pageable: Pageable) => Promise<Author[]>;
  addOne: (author: AuthorToAdd) => Promise<Author>;
}