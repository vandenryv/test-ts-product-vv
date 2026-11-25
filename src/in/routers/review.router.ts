import { Router } from 'express';
import { PageableSchema, tryParsePageable } from '#src/common/classes/Pageable.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import type ReviewAdapterInPort from '#src/domain/port/in/ReviewAdapterInPort.ts';
import { queryStringExtractor } from '#src/in/routers/util.ts';

export const basePath = '/reviews';

export function routerFactory(reviewAdapter: ReviewAdapterInPort): Router {
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
    const reviews = await reviewAdapter.getPage(pageable);
    res.type('json').send(JSON.stringify({ reviews }, bigintReplacer));
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
    const review = await reviewAdapter.findOneById(id);
    res.type('json').send(JSON.stringify({ review }, bigintReplacer));
  });

  return router;
}

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}