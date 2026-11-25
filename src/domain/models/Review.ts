
import type { Author, AuthorToAdd } from './Author.ts';

export interface Review {
  id: string;
  notation: number;
  date: Date;
  comment: string;
  productId: string;
  authorId: string;
  author: Author;
}

export type ReviewToAdd = Omit<Review, 'author'> & { author: AuthorToAdd };