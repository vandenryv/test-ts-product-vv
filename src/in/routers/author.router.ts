import { Router } from 'express';
import { PageableSchema, tryParsePageable } from '#src/common/classes/Pageable.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import type { AuthorAdapterInPort } from '#src/domain/port/in/AuthorAdapterInPort.ts';
import { queryStringExtractor } from '#src/in/routers/util.ts';

export const basePath = '/authors';

export function routerFactory(authorAdapter: AuthorAdapterInPort): Router {
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
    const authors = await authorAdapter.getPage(pageable);
    const result = {
      values: authors,
      pageable: pageable,
    };
    res.type('json').send(JSON.stringify({ result }, bigintReplacer));
  });

  router.get(basePath + '/:id', async (req, res) => {
    const id = queryStringExtractor(req.params.id)
    if (!id) {
      res
        .type('json')
        .status(HttpStatusCodes.BAD_REQUEST)
        .send({ error: 'id should be a string' });
      return;
    }
    const author = await authorAdapter.findOneById(id);
    res.type('json').send(JSON.stringify({ author }, bigintReplacer));
  });

  return router;
}

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}