import type { Pageable } from '#src/common/classes/Pageable.ts';
import { NotFoundError } from '#src/common/classes/route-errors.ts';
import type { ProductAdapterOutPort } from '#src/domain/port/out/ProductAdapterOutPort.ts';
import type { Product, ProductToAdd } from '#src/domain/models/Product.ts';
import type { PrismaClient } from '#src/generated/prisma/client.ts';
import ProductRepo from '#src/out/repos/ProductRepo.ts';
import { ProductAlreadyExistError } from '#src/common/classes/Errors.ts';

export class ProductAdapter implements ProductAdapterOutPort {
  private readonly productRepo: ProductRepo;

  constructor(prisma: PrismaClient) {
    this.productRepo = new ProductRepo(prisma);
  }

  getTotalNumberOfProducts(): Promise<number> {
    return this.productRepo.count();
  }
  getMostAppreciatedProducts() : Promise<Product[]>{
    return this.productRepo.findTopPositive(5);
  }
  getProductWithLowestRating(): Promise<Product[]> {
    return this.productRepo.findLowestRated(5);
  }

  async findOneById(id: string): Promise<Product> {
    const product = await this.productRepo.getOne(id);
    if (!product) throw new NotFoundError(`Product not found: ${id}`);
    return product;
  }

  async getPage(pageable: Pageable): Promise<Product[]> {
    return (await this.productRepo.getPage(pageable));
  }

  async addOne(product: ProductToAdd): Promise<Product> {
    const { reviews, price,reference, ...data } = product;

    const existing = await this.productRepo.findOneByReference(reference)
    if(existing) throw new ProductAlreadyExistError(`Product already exists: ${reference}`)

    return await this.productRepo.addOne({
      ...data,
      reference,
      price: price.toString(),
      reviews: {
        create: reviews.map(({ productId, authorId, author, ...review }) => ({
          ...review,
          date: new Date(review.date),
          author: authorId
            ? { connectOrCreate: { where: { id: authorId }, create: { ...author, id: authorId } } }
            : { create: author },
        })),
      },
    });
  }
}