
import type { Author } from './Author.ts';

export interface Review {
  id: string;
  notation: number;
  date: Date;
  comment: string;
  productId: string;
  authorId: string;
  author: Author;
}