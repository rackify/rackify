import fastify from 'fastify';
import { setConfig, buildConfig, PikeAppConfig } from '@pike/config';
// import { getConnection } from './db';
import { loadControllers } from './load-controllers';
import { PikeServer } from './types';

export async function createApp(opts: Partial<PikeAppConfig>): Promise<PikeServer> {
  // await getConnection();
  const config = buildConfig(opts);

  const app = fastify({
    logger: true
  });

  setConfig(app, config);

  await loadControllers(app);

  return app;
}
