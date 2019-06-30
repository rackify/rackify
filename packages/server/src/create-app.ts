import Fastify from 'fastify';
import { kState } from 'fastify/lib/symbols';

import http from 'http';
import { setConfig, buildConfig, PikeAppConfig } from '@pikejs/config';
// import { getConnection } from './db';
import { loadControllers } from './load-controllers';
import { PikeServer, PikeRequest, PikeReply } from './types';
import { initializeServices } from './services';
import { setRequestContext, getContextNamespace } from './context';
import { injectRequest } from './inject';

export async function createApp(opts: Partial<PikeAppConfig>): Promise<PikeServer> {
  // await getConnection();
  const config = buildConfig(opts);

  let httpHandler: any;
  const fastify = Fastify({
    logger: false,
    ...opts.fastify,
    serverFactory: (handler: any) => {
      httpHandler = async (req: any, res: any) => {
        const context = getContextNamespace();
        context.run(() => handler(req, res) );
      };
      return http.createServer(httpHandler);
    }
  } as any);

  const inject = (opts: Fastify.HTTPInjectOptions | string, cb?: any) => {
    if ((fastify as any)[kState].started) {
      return injectRequest(httpHandler, opts, cb);
    }

    if (cb) {
      fastify.ready(err => {
        if (err) cb(err, null);
        else injectRequest(httpHandler, opts, cb);
      });
    } else {
      return fastify.ready()
        .then(() => injectRequest(httpHandler, opts));
    }
  };

  fastify.inject = inject as any;

  const app = { fastify, inject } as PikeServer;

  setConfig(app, config);
  app.fastify.addHook('onRequest', async (request: PikeRequest, reply: PikeReply) => {
    setRequestContext(request, reply );
  });

  initializeServices(app);

  await loadControllers(app);

  return app;
}
