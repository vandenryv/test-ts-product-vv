import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Author } from '#src/domain/types/Author.ts';

export interface AuthorAdapterInPort {
  findOneById: (id: string) => Promise<Author>;
  getPage: (pageable: Pageable) => Promise<Author[]>;
  addOne: (author: Author) => Promise<Author>;
}