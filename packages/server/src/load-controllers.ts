import 'reflect-metadata';

import glob from 'fast-glob';
import { getConfig } from '@pike/config';

import { RouteKey } from './decorators';
import { PikeServer } from './types';

const loadRoute = (app: PikeServer, potentialRoutable: any) => {
  if (typeof potentialRoutable !== 'object' && typeof potentialRoutable !== 'function') {
    return;
  }

  const route = Reflect.getOwnMetadata(RouteKey, potentialRoutable);
  if (!route) {
    return;
  }

  for (let m in route) {
    const method = route[m];
    app.route(method);
  }
};

const loadRoutesFromModule = (app: PikeServer, controllerModule: any) => {
  for (let exp in controllerModule) {
    loadRoute(app, controllerModule[exp]);
  }
};

export const loadControllers = async (app: PikeServer) => {
  const config = getConfig(app);

  const { globs, routes } = config.routes.reduce((memo, cfg) => {
    if (typeof cfg === 'string') {
      memo.globs.push(cfg);
    } else {
      memo.routes.push(cfg);
    }
    return memo;
  }, { globs: [], routes: [] } as any );

  const controllers = [...glob.sync(globs, { absolute: true }), ...routes];

  for (let i=0;i < controllers.length; i++) {
    let fileImport = controllers[i] as string;
    const controllerModule = await import(fileImport);
    loadRoutesFromModule(app, controllerModule);
  }
};
