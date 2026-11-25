import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import { ProductAlreadyExistError } from '#src/common/classes/Errors.ts';
import type { ProductAdapterInPort } from '#src/domain/port/in/ProductAdapterInPort.ts';
import { DataIntegrationFromFile } from '#src/in/dataIntegrationFromFile.ts';

void test('imports only explicitly selected files and waits for addOne', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'dropin-test-'));
  const originalDirectory = process.cwd();
  const originalArgv = process.argv;
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
      getTotalNumberOfProducts: () => { throw new Error('unexpected call'); },
      getMostAppreciatedProducts:  () => { throw new Error('unexpected call'); },
      getProductWithLowestRating: () => { throw new Error('unexpected call'); },
    };
    process.chdir(directory);
    process.argv = ['node', 'test'];
    await new DataIntegrationFromFile(adapter).integrateFiles();
    assert.deepEqual(calls, []);
    process.argv = ['node', 'test', '--import-json', 'first.json'];
    await new DataIntegrationFromFile(adapter).integrateFiles();
    assert.deepEqual(calls, products.slice(0, 2));
    process.argv = ['node', 'test', '--import-json', 'second.json'];
    await new DataIntegrationFromFile(adapter).integrateFiles();
    assert.deepEqual(calls, products);
  } finally {
    process.argv = originalArgv;
    process.chdir(originalDirectory);
    await rm(directory, { recursive: true, force: true });
  }
});

void test('propagates invalid JSON and addOne failures', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'dropin-test-'));
  const originalDirectory = process.cwd();
  const originalArgv = process.argv;
  try {
    await mkdir(join(directory, 'sample'));
    const file = join(directory, 'sample', 'data.json');
    const adapter: ProductAdapterInPort = {
      findOneById: () => { throw new Error('unexpected call'); },
      getPage: () => { throw new Error('unexpected call'); },
      addOne: () => Promise.reject(new Error('add failed')),
      getTotalNumberOfProducts: () => { throw new Error('unexpected call'); },
      getMostAppreciatedProducts:  () => { throw new Error('unexpected call'); },
      getProductWithLowestRating: () => { throw new Error('unexpected call'); },
    };
    process.chdir(directory);
    process.argv = ['node', 'test', '--import-json', 'data.json'];
    await assert.rejects(new DataIntegrationFromFile(adapter).integrateFiles(), { code: 'ENOENT' });
    await writeFile(file, '{');
    await assert.rejects(new DataIntegrationFromFile(adapter).integrateFiles(), SyntaxError);
    await writeFile(file, '[{}]');
    await assert.rejects(new DataIntegrationFromFile(adapter).integrateFiles(), /add failed/);
  } finally {
    process.argv = originalArgv;
    process.chdir(originalDirectory);
    await rm(directory, { recursive: true, force: true });
  }
});

void test('continues importing after an existing product error', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'dropin-test-'));
  const originalDirectory = process.cwd();
  const originalArgv = process.argv;
  try {
    await mkdir(join(directory, 'sample'));
    const products = [{ reference: 'existing' }, { reference: 'new' }];
    await writeFile(join(directory, 'sample', 'data.json'), JSON.stringify(products));
    const calls: unknown[] = [];
    const adapter: ProductAdapterInPort = {
      findOneById: () => { throw new Error('unexpected call'); },
      getPage: () => { throw new Error('unexpected call'); },
      addOne: async (product) => {
        calls.push(product);
        if (product.reference === 'existing') {
          throw new ProductAlreadyExistError('already exists');
        }
        return Promise.resolve({ ...product, id: 'id', reviews: [] });
      },
      getTotalNumberOfProducts: () => { throw new Error('unexpected call'); },
      getMostAppreciatedProducts:  () => { throw new Error('unexpected call'); },
      getProductWithLowestRating: () => { throw new Error('unexpected call'); },
    };
    process.chdir(directory);
    process.argv = ['node', 'test', '--import-json', 'data.json'];
    await new DataIntegrationFromFile(adapter).integrateFiles();
    assert.deepEqual(calls, products);
  } finally {
    process.argv = originalArgv;
    process.chdir(originalDirectory);
    await rm(directory, { recursive: true, force: true });
  }
});