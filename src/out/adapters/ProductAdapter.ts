import type { Pageable } from '#src/common/classes/Pageable.ts';
import { NotFoundError } from '#src/common/classes/route-errors.ts';
import type ProductAdapterOutPort from '#src/domain/port/out/ProductAdapterOutPort.ts';
import type { Product, ProductToAdd } from '#src/domain/models/Product.ts';
import type { PrismaClient } from '#src/generated/prisma/client.ts';
import ProductRepo, { type ProductWithReviews } from '#src/out/repos/ProductRepo.ts';

function toProduct(product: ProductWithReviews): Product {
  return { ...product, price: BigInt(product.price.toString()) };
}

export class ProductAdapter implements ProductAdapterOutPort {
  private readonly productRepo: ProductRepo;

  constructor(prisma: PrismaClient) {
    this.productRepo = new ProductRepo(prisma);
  }

  async findOneById(id: string): Promise<Product> {
    const product = await this.productRepo.getOne(id);
    if (!product) throw new NotFoundError(`Product not found: ${id}`);
    return toProduct(product);
  }

  async getPage(pageable: Pageable): Promise<Product[]> {
    return (await this.productRepo.getPage(pageable)).map(toProduct);
  }

  async addOne(product: ProductToAdd): Promise<Product> {
    const { reviews, price, ...data } = product;
    return toProduct(await this.productRepo.addOne({
      ...data,
      price: price.toString(),
      reviews: { connect: reviews.map(({ id }) => ({ id })) },
    }));
  }
}