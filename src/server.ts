import { PrismaPg } from '@prisma/adapter-pg';
import express, { type NextFunction, type Request, type Response} from 'express';
import helmet from 'helmet';
import logger from 'jet-logger';
import morgan from 'morgan';

import { RouteError } from '#src/common/classes/route-errors.ts';
import HttpStatusCodes from '#src/common/constants/HttpStatusCodes.ts';
import { buildDependencyTree } from '#src/dependencyResolver.ts';
import { PrismaClient } from '#src/generated/prisma/client.ts';

import { Env, NodeEnvs } from './common/constants/env.constants.ts';

// ========================================================================= //
//                                   EXEC                                    //
// ========================================================================= //

const app = express();

// =============================== Middleware ============================== //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (Env.NODE_ENV === NodeEnvs.DEVELOPMENT) {
  app.use(morgan('dev'));
}

// Security
if (Env.NODE_ENV === NodeEnvs.PRODUCTION) {
  app.use(helmet());
}

// eslint-disable-next-line no-process-env
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const prismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const {
  router, fileIntegration
} = buildDependencyTree(prismaClient);

const dataBaseHasBeenSeeded = await fileIntegration.integrateFiles();

if(dataBaseHasBeenSeeded){
  logger.info('Database seeded correctly');
  process.exit(0);
}
// Add APIs, must be after middleware
app.use('/', router);

// Add error handler. `_next` must stay: Express only treats 4-arg middleware
// as an error handler.
app.use((err: Error, _: Request, res: Response, _next: NextFunction) => {
  if (err instanceof RouteError) {
    return res
      .status(err.status)
      .json({ error: err.message, errors: err.errors });
  }
  // Body-parser errors are client errors; don't expose the rejected body.
  if ('type' in err) {
    if (err.type === 'entity.parse.failed') {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ error: 'Invalid JSON' });
    }
    if (err.type === 'entity.too.large') {
      return res
        .status(HttpStatusCodes.PAYLOAD_TOO_LARGE)
        .json({ error: 'Request body too large' });
    }
  }
  if (Env.NODE_ENV !== NodeEnvs.TEST) {
    logger.err(err, true);
  }
  return res
    .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
    .json({ error: 'Internal Server Error' });
});

// ========================================================================= //
//                                  EXPORT                                   //
// ========================================================================= //

export default app;
