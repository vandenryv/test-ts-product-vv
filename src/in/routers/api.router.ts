import { Router } from 'express';

import type { AuthorAdapterInPort } from '#src/domain/port/in/AuthorAdapterInPort.ts';
import type ProductAdapterInPort from '#src/domain/port/in/ProductAdapterInPort.ts';
import type ReviewAdapterInPort from '#src/domain/port/in/ReviewAdapterInPort.ts';

import { routerFactory as authorRouter } from './author.router.ts';
import { routerFactory as productRouter } from './product.router.ts';
import { routerFactory as reviewRouter } from './review.router.ts';

export default function buildApiRouter(
  productAdapter: ProductAdapterInPort,
  authorAdapter: AuthorAdapterInPort,
  reviewAdapter: ReviewAdapterInPort,
): Router {
  const apiRouter = Router();

  apiRouter.use(productRouter(productAdapter));
  apiRouter.use(authorRouter(authorAdapter));
  apiRouter.use(reviewRouter(reviewAdapter));

  return apiRouter;
}

