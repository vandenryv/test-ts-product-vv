import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Decimal } from 'decimal.js';

import type { PrismaClient } from '#src/generated/prisma/client.ts';
import { ProductAdapter } from '#src/out/adapters/ProductAdapter.ts';
import { ReviewAdapter } from '#src/out/adapters/ReviewAdapter.ts';

const author = { id: 'author', firstName: 'First', lastName: 'Last', type: 'user' };
const review = { id: 'review', notation: 5, date: new Date(), comment: 'Good', productId: 'product', authorId: 'author', author };
const product = { id: 'product', reference: 'ref', name: 'Name', description: 'Description', price: new Decimal('42'), currency: 'USD', stock: 3, reviews: [review] };

void test('product adapter delegates reads and creates products with reviews', async () => {
  const calls: unknown[] = [];
  const prisma = { product: {
    findUnique: (args: { where: { id?: string; reference?: string } }) => { calls.push(args); return Promise.resolve(args.where.id ? product : null); },
    findMany: (args: unknown) => { calls.push(args); return Promise.resolve([product]); },
    create: (args: unknown) => { calls.push(args); return Promise.resolve(product); },
  } } as unknown as PrismaClient;
  const adapter = new ProductAdapter(prisma);
  const include = { reviews: { include: { author: true } } };
  assert.deepEqual(await adapter.findOneById('product'), product);
  assert.deepEqual(await adapter.getPage({ page: 2, size: 10 }), [product]);
  const { id, ...productToAdd } = product;
  assert.equal(id, 'product');
  assert.deepEqual(await adapter.addOne(productToAdd), product);
  assert.deepEqual(calls, [
    { where: { id: 'product' }, include },
    { skip: 10, take: 10, include },
    { where: { reference: 'ref' }, include },
    { data: { reference: 'ref', name: 'Name', description: 'Description', price: '42', currency: 'USD', stock: 3, reviews: { create: [{ id: 'review', notation: 5, date: review.date, comment: 'Good', author: { connectOrCreate: { where: { id: 'author' }, create: author } } }] } }, include },
  ]);
});

void test('review adapter delegates reads with authors', async () => {
  const calls: unknown[] = [];
  const prisma = { review: {
    findUnique: (args: unknown) => { calls.push(args); return Promise.resolve(review); },
    findMany: (args: unknown) => { calls.push(args); return Promise.resolve([review]); },
  } } as unknown as PrismaClient;
  const adapter = new ReviewAdapter(prisma);
  const include = { author: true };
  assert.deepEqual(await adapter.findOneById('review'), review);
  assert.deepEqual(await adapter.getPage({ page: 2, size: 10 }), [review]);
  assert.deepEqual(calls, [
    { where: { id: 'review' }, include },
    { skip: 10, take: 10, include },
  ]);
});

void test('adapters reject missing records', async () => {
  const prisma = { product: { findUnique: () => Promise.resolve(null) }, review: { findUnique: () => Promise.resolve(null) } } as unknown as PrismaClient;
  await assert.rejects(new ProductAdapter(prisma).findOneById('missing'), /Product not found: missing/);
  await assert.rejects(new ReviewAdapter(prisma).findOneById('missing'), /Review not found: missing/);
});