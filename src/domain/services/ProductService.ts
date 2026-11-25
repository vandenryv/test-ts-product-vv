import type { Pageable } from '#src/common/classes/Pageable.ts';
import type ProductAdapterInPort from '#src/domain/port/in/ProductAdapterInPort.ts';
import type { Product, ProductToAdd } from '#src/domain/models/Product.ts';

export class ProductService implements ProductAdapterInPort {
  productRepo: ProductAdapterInPort;

  constructor(productAdapterPortOut: ProductAdapterInPort) {
    this.productRepo = productAdapterPortOut;
  }

  addOne(product: ProductToAdd): Promise<Product> {
    return this.productRepo.addOne(product);
  }

  findOneById(id: string): Promise<Product> {
    return this.productRepo.findOneById(id);
  }

  getPage(pageable: Pageable): Promise<Product[]> {
    return this.productRepo.getPage(pageable);
  }
}