import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import request from 'supertest';
import { Decimal } from 'decimal.js';

import type { ProductAdapterInPort } from '#src/domain/port/in/ProductAdapterInPort.ts';
import { routerFactory as productRouterFactory } from '#src/in/routers/product.router.ts';
import type { Pageable } from '#src/common/classes/Pageable.ts';

const product = {
  id: '018f47a2-7b00-7000-8000-000000000001', reference: 'ref', name: 'Product', description: 'Description',
  price: new Decimal('123'), currency: 'USD', stock: 1, reviews: [],
};

void test('product routes call the adapter and return JSON', async () => {
  const calls: unknown[][] = [];
  const adapter: ProductAdapterInPort = {
    findOneById: (id) => { calls.push(['findOneById', id]); return Promise.resolve(product); },
    getPage: (pageable: Pageable) => { calls.push(['getPage', pageable.page, pageable.size]); return Promise.resolve([product]); },
    addOne: () => { throw new Error('unexpected call'); },
    getTotalNumberOfProducts: () => { throw new Error('unexpected call'); },
    getMostAppreciatedProducts:  () => { throw new Error('unexpected call'); },
    getProductWithLowestRating: () => { throw new Error('unexpected call'); },
  };
  const app = express().use(productRouterFactory(adapter));
  const expected = { ...product, price: '123' };

  const single = await request(app).get(`/products/${product.id}`).expect(200);
  assert.deepEqual(single.body, expected);
  const page = await request(app).get('/products?page=1&size=10').expect(200);
  assert.deepEqual(page.body, [expected]);
  assert.deepEqual(calls, [['findOneById', product.id], ['getPage', 1, 10]]);

  for (const query of ['?page=-1&size=10', '?page=0&size=-1', '?page=0&size=x']) {
    await request(app).get('/products' + query).expect(400);
  }
  assert.equal(calls.length, 2);
});
