import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import request from 'supertest';
import type { ProductAdapterInPort } from '#src/domain/port/in/ProductAdapterInPort.ts';
import type { ReviewAdapterInPort } from '#src/domain/port/in/ReviewAdapterInPort.ts';
import { routerFactory as productRouter } from '#src/in/routers/product.router.ts';
import { routerFactory as reviewRouter } from '#src/in/routers/review.router.ts';

void test('product and review pagination matches author pagination', async () => {
  const calls: unknown[] = [];
  const products: ProductAdapterInPort = {
    getPage: (pageable) => { calls.push(pageable); return Promise.resolve([]); },
    findOneById: () => { throw new Error('unexpected call'); },
    addOne: () => { throw new Error('unexpected call'); },
  };
  const reviews: ReviewAdapterInPort = {
    getPage: (pageable) => { calls.push(pageable); return Promise.resolve([]); },
    findOneById: () => { throw new Error('unexpected call'); },
    addOne: () => { throw new Error('unexpected call'); },
  };
  const app = express().use(productRouter(products)).use(reviewRouter(reviews));

  for (const path of ['/products', '/reviews']) {
    await request(app).get(`${path}?page=1&size=10`).expect(200);
    await request(app).get(path).expect(200);
    await request(app).get(`${path}?page=0&size=10`).expect(400);
    await request(app).get(`${path}?page=-1&size=10`).expect(400);
    await request(app).get(`${path}?page=invalid&size=10`).expect(400);
  }
  assert.deepEqual(calls, [
    { page: 1, size: 10 }, { page: 1, size: 10 },
    { page: 1, size: 10 }, { page: 1, size: 10 },
  ]);
});