import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PrismaClient } from '#src/generated/prisma/client.ts';
import ProductRepo from '#src/out/repos/ProductRepo.ts';

void test('lowest rated products are returned in average rating order', async () => {
  let groupByArgs: unknown;
  let findManyArgs: unknown;
  const prisma = {
    review: { groupBy: (args: unknown) => {
      groupByArgs = args;
      return Promise.resolve([{ productId: 'a' }, { productId: 'b' }, { productId: 'missing' }]);
    } },
    product: { findMany: (args: unknown) => {
      findManyArgs = args;
      return Promise.resolve([{ id: 'b', reviews: [] }, { id: 'a', reviews: [] }]);
    } },
  } as unknown as PrismaClient;

  const products = await new ProductRepo(prisma).findLowestRated();

  assert.deepEqual(groupByArgs, {
    by: ['productId'], _avg: { notation: true },
    orderBy: [{ _avg: { notation: 'asc' } }, { productId: 'asc' }], take: 5,
  });
  assert.deepEqual(findManyArgs, {
    where: { id: { in: ['a', 'b', 'missing'] } },
    include: { reviews: { include: { author: true } } },
  });
  assert.deepEqual(products.map(product => product.id), ['a', 'b']);
});

void test('lowest rated products are empty when there are no reviews', async () => {
  const prisma = {
    review: { groupBy: () => Promise.resolve([]) },
    product: { findMany: () => Promise.resolve([]) },
  } as unknown as PrismaClient;

  assert.deepEqual(await new ProductRepo(prisma).findLowestRated(), []);
});