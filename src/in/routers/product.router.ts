import { Router } from 'express';
import { PageableSchema, tryParsePageable } from '#src/common/classes/Pageable.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import type ProductAdapterInPort from '#src/domain/port/in/ProductAdapterInPort.ts';
import { queryStringExtractor } from '#src/in/routers/util.ts';









export const basePath = '/products';

export function routerFactory(productAdapter: ProductAdapterInPort): Router {
  const router = Router();

  router.get(basePath, async (req, res) => {
    const { page, size } = req.query;
    const parsedPageable = tryParsePageable({
      page: queryStringExtractor(page),
      size: queryStringExtractor(size),
    });
    if (!PageableSchema.safeParse(parsedPageable).success) {
      res
        .type('json')
        .status(HttpStatusCodes.BAD_REQUEST)
        .send({ error: 'page and size should be integers' });
      return;
    }
    const pageable = PageableSchema.parse(parsedPageable);
    const products = await productAdapter.getPage(pageable);
    res.type('json').send(JSON.stringify({ products }, bigintReplacer));
  });

  router.get(basePath + '/:id', async (req, res) => {
    const id = queryStringExtractor(req.params.id);
    if (!id) {
      res
        .type('json')
        .status(HttpStatusCodes.BAD_REQUEST)
        .send({ error: 'id should be a string' });
      return;
    }
    const product = await productAdapter.findOneById(id);
    res.type('json').send(JSON.stringify({ product }, bigintReplacer));
  });

  return router;
}

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}
