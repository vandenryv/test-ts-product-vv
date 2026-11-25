import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import request from 'supertest';

import type ProductAdapterInPort from '#src/domain/port/in/ProductAdapterInPort.ts';
import { routerFactory as productRouterFactory } from '#src/in/routers/product.router.ts';
import { size } from 'zod';
import type { Pageable } from '#src/common/classes/Pageable.ts';

const product = {
  id: '123', reference: 'ref', name: 'Product', description: 'Description',
  price: 123n, currency: 'USD', stock: 1, reviews: [],
};

void test('product routes call the adapter and return JSON', async () => {
  const calls: unknown[][] = [];
  const adapter: ProductAdapterInPort = {
    findOneById: (id) => { calls.push(['findOneById', id]); return Promise.resolve(product); },
    getPage: (pageable: Pageable) => { calls.push(['getPage', pageable.page, pageable.size]); return Promise.resolve([product]); },
    addOne: (data) => Promise.resolve(data),
  };
  const app = express().use(productRouterFactory(adapter));
  const expected = { ...product, price: '123' };

  const single = await request(app).get('/products/123').expect(200);
  assert.deepEqual(single.body, { product: expected });
  const page = await request(app).get('/products?page=0&size=10').expect(200);
  assert.deepEqual(page.body, { products: [expected] });
  assert.deepEqual(calls, [['findOneById', '123'], ['getPage', 0, 10]]);

  for (const query of ['', '?page=-1&size=10', '?page=0&size=0', '?page=1.5&size=10', '?page=0&size=x', '?page=0&page=1&size=10']) {
    await request(app).get('/products' + query).expect(400);
  }
  assert.equal(calls.length, 2);
});
