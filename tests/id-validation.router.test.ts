import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import request from 'supertest';
import type { ProductAdapterInPort } from '#src/domain/port/in/ProductAdapterInPort.ts';
import type { ReviewAdapterInPort } from '#src/domain/port/in/ReviewAdapterInPort.ts';
import { routerFactory as productRouter } from '#src/in/routers/product.router.ts';
import { routerFactory as reviewRouter } from '#src/in/routers/review.router.ts';

void test('product and review IDs must be UUIDv7 strings', async () => {
  const calls: string[] = [];
  const author = { id: 'a', firstName: 'A', lastName: 'B', type: 'user' };
  const product = { id: 'p', reference: 'ref', name: 'Product', description: 'Description', price: 123n, currency: 'USD', stock: 1, reviews: [] };
  const review = { id: 'r', notation: 5, date: new Date('2020-01-01'), comment: 'Good', productId: 'p', authorId: 'a', author };
  const products: ProductAdapterInPort = {
    findOneById: (id) => { calls.push(id); return Promise.resolve(product); },
    getPage: () => Promise.resolve([]),
    addOne: () => { throw new Error('unexpected call'); },
  };
  const reviews: ReviewAdapterInPort = {
    findOneById: (id) => { calls.push(id); return Promise.resolve(review); },
    getPage: () => Promise.resolve([]),
    addOne: () => { throw new Error('unexpected call'); },
  };
  const app = express().use(productRouter(products)).use(reviewRouter(reviews));
  const validId = '018f47a2-7b00-7000-8000-000000000001';

  for (const path of ['/products', '/reviews']) {
    for (const invalidId of ['not-a-uuid', '018f47a2-7b00-4000-8000-000000000001']) {
      const response = await request(app).get(`${path}/${invalidId}`).expect(400);
      assert.deepEqual(response.body, { error: 'id should be a uuidv7 string' });
    }
    await request(app).get(`${path}/${validId}`).expect(200);
  }
  assert.deepEqual(calls, [validId, validId]);
});