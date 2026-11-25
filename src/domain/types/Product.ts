import type { Review } from './Review.ts';

export interface Product {
  id: string;
  reference: string;
  name: string;
  description: string;
  price: bigint;
  currency: string;
  stock: number;
  reviews: Review[];
}