import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import request from 'supertest';

import type { AuthorAdapterInPort } from '#src/domain/port/in/AuthorAdapterInPort.ts';
import type ProductAdapterInPort from '#src/domain/port/in/ProductAdapterInPort.ts';
import type ReviewAdapterInPort from '#src/domain/port/in/ReviewAdapterInPort.ts';
import apiRouter from '#src/in/routers/api.router.ts';

void test('API routes delegate to their respective adapters', async () => {
  const author = { id: 'a', firstName: 'A', lastName: 'B', type: 'user' };
  const review = { id: 'r', notation: 5, date: new Date('2020-01-01'), comment: 'Good', productId: 'p', authorId: 'a', author };
  const product = { id: 'p', reference: 'ref', name: 'Product', description: 'Description', price: 123n, currency: 'USD', stock: 1, reviews: [] };
  const calls: unknown[][] = [];
  const authors: AuthorAdapterInPort = {
    findOneById: (id) => { calls.push(['author', id]); return Promise.resolve(author); },
    getPage: (pageable) => { calls.push(['authors', pageable]); return Promise.resolve([author]); },
    addOne: (data) => Promise.resolve(data),
  };
  const reviews: ReviewAdapterInPort = {
    findOneById: (id) => { calls.push(['review', id]); return Promise.resolve(review); },
    getPage: (pageable) => { calls.push(['reviews', pageable]); return Promise.resolve([review]); },
    addOne: (data) => Promise.resolve(data),
  };
  const products: ProductAdapterInPort = {
    findOneById: (id) => { calls.push(['product', id]); return Promise.resolve(product); },
    getPage: () => Promise.resolve([product]),
    addOne: (data) => Promise.resolve(data),
  };
  const app = express().use(apiRouter(products, authors, reviews));

  assert.deepEqual((await request(app).get('/authors/a').expect(200)).body, { author });
  assert.deepEqual((await request(app).get('/reviews/r').expect(200)).body, { review: { ...review, date: review.date.toISOString() } });
  assert.deepEqual((await request(app).get('/products/p').expect(200)).body, { product: { ...product, price: '123' } });
  await request(app).get('/authors').expect(400);
  await request(app).get('/reviews?size=invalid').expect(400);
  assert.deepEqual(calls, [['author', 'a'], ['review', 'r'], ['product', 'p']]);

  const numericQueryApp = express().use((req, _res, next) => {
    Object.defineProperty(req, 'query', { value: { page: 1, size: 10 } });
    next();
  }).use(apiRouter(products, authors, reviews));
  assert.deepEqual((await request(numericQueryApp).get('/authors').expect(200)).body, { authors: [author] });
  assert.deepEqual((await request(numericQueryApp).get('/reviews').expect(200)).body, { reviews: [{ ...review, date: review.date.toISOString() }] });
  assert.deepEqual(calls.slice(3), [['authors', { page: 1, size: 10 }], ['reviews', { page: 1, size: 10 }]]);
});