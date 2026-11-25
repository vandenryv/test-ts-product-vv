import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Product, ProductBare, ProductToAdd } from '#src/domain/models/Product.ts';

export interface ProductAdapterInPort {
  findOneById: (id: string) => Promise<Product>;
  getPage: (pageable: Pageable) => Promise<ProductBare[]>;
  addOne: (data: ProductToAdd) => Promise<Product>;
  getTotalNumberOfProducts: () => Promise<number>;
  getMostAppreciatedProducts: () => Promise<Product[]>;
  getProductWithLowestRating: () => Promise<Product[]>;
}