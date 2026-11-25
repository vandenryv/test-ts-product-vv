import type { Review, ReviewToAdd } from './Review.ts';
import { Decimal } from 'decimal.js';

export interface Product {
  id: string;
  reference: string;
  name: string;
  description: string;
  price: Decimal;
  currency: string;
  stock: number;
  reviews: Review[];
}

export type ProductToAdd = Omit<Product, 'id' | 'reviews'> & { reviews: ReviewToAdd[] };

export type ProductBare = Omit<Product, 'reviews'>;