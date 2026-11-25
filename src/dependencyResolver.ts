import type { Router } from 'express';

import { AuthorService } from '#src/domain/services/AuthorService.ts';
import { ProductService } from '#src/domain/services/ProductService.ts';
import { ReviewService } from '#src/domain/services/ReviewService.ts';
import type { PrismaClient } from '#src/generated/prisma/client.ts';
import buildApiRouter from '#src/in/routers/api.router.ts';
import { AuthorAdapter } from '#src/out/adapters/AuthorAdapter.ts';
import { ProductAdapter } from '#src/out/adapters/ProductAdapter.ts';
import { ReviewAdapter } from '#src/out/adapters/ReviewAdapter.ts';
import { DataIntegrationFromFile } from '#src/in/dataIntegrationFromFile.ts';

/**
 * Build the dependencyTree, allowing dependency injection
 * @param prismaClient
 */
export function buildDependencyTree(prismaClient: PrismaClient): TreeRoots {

  //Out
  const productAdapter = new ProductAdapter(prismaClient);
  const reviewAdapter = new ReviewAdapter(prismaClient);
  const authorAdapter = new AuthorAdapter(prismaClient);

  //Domain
  const productService = new ProductService(productAdapter);
  const reviewService = new ReviewService(reviewAdapter);
  const authorService = new AuthorService(authorAdapter);

  //In
  return {
    router: buildApiRouter(productService, authorService, reviewService),
    fileIntegration: new DataIntegrationFromFile(productService)
  }

}

type TreeRoots = {
  router: Router,
  fileIntegration: DataIntegrationFromFile
}