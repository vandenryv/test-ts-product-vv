import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { ProductToAdd } from '#src/domain/models/Product.ts';
import type { ProductAdapterInPort } from '#src/domain/port/in/ProductAdapterInPort.ts';
import logger from 'jet-logger';
import { ProductAlreadyExistError } from '#src/common/classes/Errors.ts';

export class DataIntegrationFromFile {
  private readonly productPort: ProductAdapterInPort;
  private readonly directory = 'sample';

  constructor(productPort: ProductAdapterInPort) {
    this.productPort = productPort;
  }

  async integrateFiles(): Promise<void> {
    const fileToRead = this.fileNameToIntegrate();
    if (!fileToRead){
      return;
    }
      const products = JSON.parse(await readFile(join(this.directory, fileToRead), 'utf8')) as ProductToAdd[];
      for (const product of products) {
        try {
          await this.productPort.addOne(product);
        }catch(e){
          if(e instanceof ProductAlreadyExistError){
            logger.warn(e)
          }else{
            throw e;
          }
        }
      }

  }

  private fileNameToIntegrate(): string | undefined {
    const args =  process.argv;
    const index = args.findIndex((arg) => arg === '--import-json');
    if (index !== -1) {
      if (index + 1 < args.length){
      return args[index + 1];
      }else{
        logger.err('Argument --import-json found but not value');
        return undefined;
      }
    }
    return undefined;
  }
}