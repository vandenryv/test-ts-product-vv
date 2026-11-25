import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Decimal } from 'decimal.js';

import type { ProductToAdd } from '#src/domain/models/Product.ts';
import type { PrismaClient } from '#src/generated/prisma/client.ts';
import { ProductAdapter } from '#src/out/adapters/ProductAdapter.ts';

void test('product creation saves reviews and connects or creates their authors', async () => {
  const calls: unknown[] = [];
  const prisma = { product: {
    findUnique: () => Promise.resolve(null),
    create: (args: unknown) => { calls.push(args); return Promise.resolve({}); },
  } } as unknown as PrismaClient;
  const adapter = new ProductAdapter(prisma);
  const author = { firstName: 'First', lastName: 'Last', type: 'user' };
  const date = new Date('2024-01-01T00:00:00Z');
  const review = { id: 'review-1', notation: 5, date, comment: 'Good', productId: 'ignored', authorId: 'author-1', author };
  const product = { reference: 'ref', name: 'Name', description: 'Description', price: new Decimal('42'), currency: 'USD', stock: 3 };

  await adapter.addOne({ ...product, reviews: [review, { ...review, id: 'review-2' }] });
  await adapter.addOne({ ...product, reviews: [] });

  const nestedReview = {
    id: 'review-1', notation: 5, date, comment: 'Good',
    author: { connectOrCreate: { where: { id: 'author-1' }, create: { id: 'author-1', ...author } } },
  };
  const include = { reviews: { include: { author: true } } };
  const data = { ...product, price: '42' };
  assert.deepEqual(calls, [
    { data: { ...data, reviews: { create: [nestedReview, { ...nestedReview, id: 'review-2' }] } }, include },
    { data: { ...data, reviews: { create: [] } }, include },
  ]);
});

void test('product creation accepts imported dates and authors without IDs', async () => {
  let created: unknown;
  const prisma = { product: {
    findUnique: () => Promise.resolve(null),
    create: (args: unknown) => { created = args; return Promise.resolve({}); },
  } } as unknown as PrismaClient;
  const input = JSON.parse('{"reference":"ref","name":"Name","description":"Description","price":42,"currency":"EUR","stock":3,"reviews":[{"notation":5,"date":"2025-04-06T02:09:10","comment":"Good","author":{"firstName":"First","lastName":"Last","type":"user"}}]}') as ProductToAdd;

  await new ProductAdapter(prisma).addOne(input);

  assert.deepEqual(created, {
    data: {
      reference: 'ref', name: 'Name', description: 'Description', price: '42', currency: 'EUR', stock: 3,
      reviews: { create: [{ notation: 5, date: new Date('2025-04-06T02:09:10'), comment: 'Good', author: { create: { firstName: 'First', lastName: 'Last', type: 'user' } } }] },
    },
    include: { reviews: { include: { author: true } } },
  });
});