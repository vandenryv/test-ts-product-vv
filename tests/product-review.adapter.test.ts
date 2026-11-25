import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PrismaClient } from '#src/generated/prisma/client.ts';
import { ProductAdapter } from '#src/out/adapters/ProductAdapter.ts';
import { ReviewAdapter } from '#src/out/adapters/ReviewAdapter.ts';

const author = { id: 'author', firstName: 'First', lastName: 'Last', type: 'user' };
const review = { id: 'review', notation: 5, date: new Date(), comment: 'Good', productId: 'product', authorId: 'author', author };
const product = { id: 'product', reference: 'ref', name: 'Name', description: 'Description', price: 42n, currency: 'USD', stock: 3, reviews: [review] };

void test('product adapter delegates and maps products with reviews', async () => {
  const calls: unknown[] = [];
  const stored = { ...product, price: { toString: () => '42' } };
  const prisma = { product: {
    findUnique: (args: unknown) => { calls.push(args); return Promise.resolve(stored); },
    findMany: (args: unknown) => { calls.push(args); return Promise.resolve([stored]); },
    create: (args: unknown) => { calls.push(args); return Promise.resolve(stored); },
  } } as unknown as PrismaClient;
  const adapter = new ProductAdapter(prisma);
  const include = { reviews: { include: { author: true } } };
  assert.deepEqual(await adapter.findOneById('product'), product);
  assert.deepEqual(await adapter.getPage({ page: 2, size: 10 }), [product]);
  assert.deepEqual(await adapter.addOne(product), product);
  assert.deepEqual(calls, [
    { where: { id: 'product' }, include },
    { skip: 20, take: 10, include },
    { data: { id: 'product', reference: 'ref', name: 'Name', description: 'Description', price: '42', currency: 'USD', stock: 3, reviews: { connect: [{ id: 'review' }] } }, include },
  ]);
});

void test('review adapter delegates and connects existing relations', async () => {
  const calls: unknown[] = [];
  const prisma = { review: {
    findUnique: (args: unknown) => { calls.push(args); return Promise.resolve(review); },
    findMany: (args: unknown) => { calls.push(args); return Promise.resolve([review]); },
    create: (args: unknown) => { calls.push(args); return Promise.resolve(review); },
  } } as unknown as PrismaClient;
  const adapter = new ReviewAdapter(prisma);
  const include = { author: true };
  assert.deepEqual(await adapter.findOneById('review'), review);
  assert.deepEqual(await adapter.getPage({ page: 2, size: 10 }), [review]);
  assert.deepEqual(await adapter.addOne(review), review);
  assert.deepEqual(calls, [
    { where: { id: 'review' }, include },
    { skip: 20, take: 10, include },
    { data: { id: 'review', notation: 5, date: review.date, comment: 'Good', author: { connect: { id: 'author' } }, product: { connect: { id: 'product' } } }, include },
  ]);
});

void test('adapters reject missing records', async () => {
  const prisma = { product: { findUnique: () => Promise.resolve(null) }, review: { findUnique: () => Promise.resolve(null) } } as unknown as PrismaClient;
  await assert.rejects(new ProductAdapter(prisma).findOneById('missing'), /Product not found: missing/);
  await assert.rejects(new ReviewAdapter(prisma).findOneById('missing'), /Review not found: missing/);
});