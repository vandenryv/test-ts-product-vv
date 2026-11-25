import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PageableSchema } from '#src/common/classes/Pageable.ts';

void test('Pageable requires positive integer page and size', () => {
  assert.equal(PageableSchema.safeParse({ page: 1, size: 10 }).success, true);

  for (const value of [0, -1, 1.5, '1', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(PageableSchema.safeParse({ page: value, size: 10 }).success, false);
    assert.equal(PageableSchema.safeParse({ page: 1, size: value }).success, false);
  }

  for (const value of [{}, { page: 1 }, { size: 10 }, null, []]) {
    assert.equal(PageableSchema.safeParse(value).success, false);
  }
});