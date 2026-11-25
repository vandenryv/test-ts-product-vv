import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import request from 'supertest';
import { Decimal } from 'decimal.js';

import type { AuthorAdapterInPort } from '#src/domain/port/in/AuthorAdapterInPort.ts';
import type { ProductAdapterInPort } from '#src/domain/port/in/ProductAdapterInPort.ts';
import type { ReviewAdapterInPort } from '#src/domain/port/in/ReviewAdapterInPort.ts';
import apiRouter from '#src/in/routers/api.router.ts';

void test('API routes delegate to their respective adapters', async () => {
  const authorId = '018f47a2-7b00-7000-8000-000000000001';
  const reviewId = '018f47a2-7b00-7000-8000-000000000002';
  const productId = '018f47a2-7b00-7000-8000-000000000003';
  const author = { id: authorId, firstName: 'A', lastName: 'B', type: 'user' };
  const review = { id: reviewId, notation: 5, date: new Date('2020-01-01'), comment: 'Good', productId, authorId, author };
  const product = { id: productId, reference: 'ref', name: 'Product', description: 'Description', price: new Decimal('123'), currency: 'USD', stock: 1, reviews: [] };
  const calls: unknown[][] = [];


  const authors: AuthorAdapterInPort = {
    findOneById: (id) => { calls.push(['author', id]); return Promise.resolve(author); },
    getPage: (pageable) => { calls.push(['authors', pageable]); return Promise.resolve([author]); },
  };
  const reviews: ReviewAdapterInPort = {
    findOneById: (id) => { calls.push(['review', id]); return Promise.resolve(review); },
    getPage: (pageable) => { calls.push(['reviews', pageable]); return Promise.resolve([review]); },
    findByProductId: (id) => { calls.push(['reviewsByProduct', id]); return Promise.resolve([review]); },
    getTotalNumberOfReviews: () => { calls.push(['reviewCount']); return Promise.resolve(2); },
  };
  const products: ProductAdapterInPort = {
    findOneById: (id) => { calls.push(['product', id]); return Promise.resolve(product); },
    getPage: (pageable) => { calls.push(['products', pageable]); return Promise.resolve([product]); },
    addOne: () => { throw new Error('unexpected call'); },
    getTotalNumberOfProducts: () => { calls.push(['productCount']); return Promise.resolve(3); },
    getMostAppreciatedProducts: () => { calls.push(['mostAppreciated']); return Promise.resolve([product]); },
    getProductWithLowestRating: () => { calls.push(['worstRated']); return Promise.resolve([product]); },
  };

  const app = express().use(apiRouter(products, authors, reviews));

  assert.deepEqual((await request(app).get(`/authors/${authorId}`).expect(200)).body, { author });
  assert.deepEqual((await request(app).get(`/reviews/${reviewId}`).expect(200)).body, { ...review, date: review.date.toISOString() });
  assert.deepEqual((await request(app).get(`/products/${productId}`).expect(200)).body, { ...product, price: '123' });

  await request(app).get('/authors?page=invalid').expect(400);
  await request(app).get('/reviews?size=invalid').expect(400);
  await request(app).get('/products?page=-1').expect(400);
  assert.deepEqual(calls, [['author', authorId], ['review', reviewId], ['product', productId]]);

  const pageable = { page: 1, size: 10 };
  assert.deepEqual((await request(app).get('/authors?page=1&size=10').expect(200)).body, { result: { values: [author], pageable } });
  assert.deepEqual((await request(app).get('/reviews?page=1&size=10').expect(200)).body, [{ ...review, date: review.date.toISOString() }]);
  assert.deepEqual((await request(app).get('/products?page=1&size=10').expect(200)).body, [{ ...product, price: '123' }]);
  assert.deepEqual(calls.slice(3), [['authors', pageable], ['reviews', pageable], ['products', pageable]]);

  assert.deepEqual((await request(app).get('/products/count').expect(200)).body, { count: 3 });
  assert.deepEqual((await request(app).get('/products/mostApreciated').expect(200)).body, [{ ...product, price: '123' }]);
  assert.deepEqual((await request(app).get('/products/worstRated').expect(200)).body, [{ ...product, price: '123' }]);
  assert.deepEqual((await request(app).get('/reviews/count').expect(200)).body, { count: 2 });
  assert.deepEqual((await request(app).get(`/reviews/productId/${productId}`).expect(200)).body, [{ ...review, date: review.date.toISOString() }]);
  assert.deepEqual((await request(app).get('/reviews/productId/invalid').expect(400)).body, { error: 'productId should be a uuidv7 string' });
  assert.deepEqual(calls.slice(6), [
    ['productCount'], ['mostAppreciated'], ['worstRated'], ['reviewCount'], ['reviewsByProduct', productId],
  ]);
});