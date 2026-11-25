import { Router } from 'express';
import { PageableSchema, tryParsePageable } from '#src/common/classes/Pageable.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import type { ProductAdapterInPort } from '#src/domain/port/in/ProductAdapterInPort.ts';
import { idSchema, queryStringExtractor } from '#src/in/routers/util.ts';

export const basePath = '/products';

export function routerFactory(productAdapter: ProductAdapterInPort): Router {
  const router = Router();

  router.get(basePath, async (req, res) => {
    const { page, size } = req.query;
    const parsedPageable = tryParsePageable({
      page: queryStringExtractor(page),
      size: queryStringExtractor(size),
    });
    const safeParse = PageableSchema.safeParse(parsedPageable);
    if (!safeParse.success) {
      res
        .type('json')
        .status(HttpStatusCodes.BAD_REQUEST)
        .send({ error: 'page and size should be integers' });
      return;
    }
    const pageable = safeParse.data;
    const products = await productAdapter.getPage(pageable);
    res.type('json').send(JSON.stringify( products ));
  });

  router.get(basePath + "/count", async (req, res) => {
    const count = await productAdapter.getTotalNumberOfProducts();
    res.type('json').send(JSON.stringify( {count: count }));
  })

  router.get(basePath + "/mostApreciated", async (req, res) => {
    const products = await productAdapter.getMostAppreciatedProducts();
    res.type('json').send(JSON.stringify( products ));
  })

  router.get(basePath + "/worstRated",async (req,res) =>{
    const products = await productAdapter.getProductWithLowestRating();
    res.type('json').send(JSON.stringify( products ));
  })

  router.get(basePath + '/:id', async (req, res) => {
    const id = queryStringExtractor(req.params.id);
    const safeParse = idSchema.safeParse(id);
    if (!safeParse.success) {
      res
        .type('json')
        .status(HttpStatusCodes.BAD_REQUEST)
        .send({ error: 'id should be a uuidv7 string' });
      return;
    }
    const product = await productAdapter.findOneById(safeParse.data);
    res.type('json').send(JSON.stringify( product ));
  });

  return router;
}
