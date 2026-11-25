import type { Product } from '#src/domain/types/Product.ts';
import type { Pageable } from '#src/common/classes/Pageable.ts';


export default interface ProductAdapterOutPort {
  findOneById: (id: string) => Promise<Product>;
  getPage:  (pageable: Pageable)  => Promise<Product[]>;
  addOne: (data: Product) => Promise<Product>;
}