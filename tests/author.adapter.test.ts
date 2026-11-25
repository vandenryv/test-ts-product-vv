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
  } } as unknown as PrismaClient;
  const adapter = new AuthorAdapter(prisma);

  assert.deepEqual(await adapter.findOneById('id'), author);
  assert.deepEqual(await adapter.getPage({ page: 2, size: 10 }), [author]);
  assert.deepEqual(calls, [{ where: { id: 'id' } }, { skip: 10, take: 10 }]);
});

void test('author adapter rejects missing authors', async () => {
  const prisma = { author: { findUnique: () => Promise.resolve(null) } } as unknown as PrismaClient;
  await assert.rejects(new AuthorAdapter(prisma).findOneById('missing'), /Author not found: missing/);
});