import type { Pageable } from '#src/common/classes/Pageable.ts';
import { NotFoundError } from '#src/common/classes/route-errors.ts';
import type ProductAdapterOutPort from '#src/domain/port/out/ProductAdapterOutPort.ts';
import type { Product } from '#src/domain/types/Product.ts';
import type { PrismaClient } from '#src/generated/prisma/client.ts';
import ProductRepo from '#src/out/repos/ProductRepo.ts';

type StoredProduct = NonNullable<Awaited<ReturnType<ReturnType<typeof ProductRepo>['getOne']>>>;

function toProduct(product: StoredProduct): Product {
  return { ...product, price: BigInt(product.price.toString()) };
}

export class ProductAdapter implements ProductAdapterOutPort {
  private readonly productRepo: ReturnType<typeof ProductRepo>;

  constructor(prisma: PrismaClient) {
    this.productRepo = ProductRepo(prisma);
  }

  async findOneById(id: string): Promise<Product> {
    const product = await this.productRepo.getOne(id);
    if (!product) throw new NotFoundError(`Product not found: ${id}`);
    return toProduct(product);
  }

  async getPage(pageable: Pageable): Promise<Product[]> {
    return (await this.productRepo.getPage(pageable)).map(toProduct);
  }

  async addOne(product: Product): Promise<Product> {
    const { reviews, price, ...data } = product;
    return toProduct(await this.productRepo.addOne({
      ...data,
      price: price.toString(),
      reviews: { connect: reviews.map(({ id }) => ({ id })) },
    }));
  }
}