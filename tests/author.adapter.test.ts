import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PrismaClient } from '#src/generated/prisma/client.ts';
import { AuthorAdapter } from '#src/out/adapters/AuthorAdapter.ts';

void test('author adapter delegates to the repository', async () => {
  const author = { id: 'id', firstName: 'First', lastName: 'Last', type: 'user' };
  const calls: unknown[] = [];
  const prisma = { author: {
    findUnique: (args: unknown) => { calls.push(args); return Promise.resolve(author); },
    findMany: (args: unknown) => { calls.push(args); return Promise.resolve([author]); },
    create: (args: unknown) => { calls.push(args); return Promise.resolve(author); },
  } } as unknown as PrismaClient;
  const adapter = new AuthorAdapter(prisma);

  assert.deepEqual(await adapter.findOneById('id'), author);
  assert.deepEqual(await adapter.getPage({ page: 2, size: 10 }), [author]);
  assert.deepEqual(await adapter.addOne(author), author);
  assert.deepEqual(calls[0], { where: { id: 'id' } });
  assert.deepEqual(calls[1], { skip: 20, take: 10 });
  const creation = calls[2] as { data: typeof author & { created: Date; origin: string } };
  assert.deepEqual({ ...creation.data, created: undefined }, { ...author, created: undefined, origin: 'unknown' });
  assert.ok(creation.data.created instanceof Date);
});

void test('author adapter rejects missing authors', async () => {
  const prisma = { author: { findUnique: () => Promise.resolve(null) } } as unknown as PrismaClient;
  await assert.rejects(new AuthorAdapter(prisma).findOneById('missing'), /Author not found: missing/);
});