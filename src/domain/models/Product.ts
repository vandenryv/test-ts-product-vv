import type { Review, ReviewToAdd } from './Review.ts';

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

export type ProductToAdd = Omit<Product, 'id' | 'reviews'> & { reviews: ReviewToAdd[] };