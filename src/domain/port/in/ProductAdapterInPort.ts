import type { Pageable } from '#src/common/classes/Pageable.ts';
import type { Product } from '#src/domain/types/Product.ts';

export default interface ProductAdapterInPort {
  findOneById: (id: string) => Promise<Product>;
  getPage: (pageable: Pageable) => Promise<Product[]>;
  addOne: (data: Product) => Promise<Product>;
}