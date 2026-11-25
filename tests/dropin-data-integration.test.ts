import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import type { ProductAdapterInPort } from '#src/domain/port/in/ProductAdapterInPort.ts';
import { DataIntegrationFromFile } from '#src/in/dataIntegrationFromFile.ts';

void test('integrates every product from every file and waits for addOne', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'dropin-test-'));
  const originalDirectory = process.cwd();
  try {
    await mkdir(join(directory, 'sample'));
    const products = [{ reference: 'one' }, { reference: 'two' }, { reference: 'three' }];
    await writeFile(join(directory, 'sample', 'first.json'), JSON.stringify(products.slice(0, 2)));
    await writeFile(join(directory, 'sample', 'second.json'), JSON.stringify(products.slice(2)));
    const calls: unknown[] = [];
    const adapter: ProductAdapterInPort = {
      findOneById: () => { throw new Error('unexpected call'); },
      getPage: () => { throw new Error('unexpected call'); },
      addOne: async (product) => {
        await Promise.resolve();
        calls.push(product);
        return { ...product, id: 'id', reviews: [] };
      },
    };
    process.chdir(directory);
    await new DataIntegrationFromFile(adapter).integrateFiles();
    assert.deepEqual(calls, products);
  } finally {
    process.chdir(originalDirectory);
    await rm(directory, { recursive: true, force: true });
  }
});

void test('propagates invalid JSON and addOne failures', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'dropin-test-'));
  const originalDirectory = process.cwd();
  try {
    await mkdir(join(directory, 'sample'));
    const file = join(directory, 'sample', 'data.json');
    const adapter: ProductAdapterInPort = {
      findOneById: () => { throw new Error('unexpected call'); },
      getPage: () => { throw new Error('unexpected call'); },
      addOne: () => Promise.reject(new Error('add failed')),
    };
    process.chdir(directory);
    await writeFile(file, '{');
    await assert.rejects(new DataIntegrationFromFile(adapter).integrateFiles(), SyntaxError);
    await writeFile(file, '[{}]');
    await assert.rejects(new DataIntegrationFromFile(adapter).integrateFiles(), /add failed/);
  } finally {
    process.chdir(originalDirectory);
    await rm(directory, { recursive: true, force: true });
  }
});