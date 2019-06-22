import glob from 'fast-glob';
import { getConfig, getMetadata, setMetadata } from '@pike/config';

import { RouteKey, ContextKey } from './keys';
import { PikeServer } from './types';
import { getInstance } from './services';


const loadRoute = (app: PikeServer, Controller: any) => {
  if (typeof Controller !== 'function') {
    return;
  }

  const routeMap = getMetadata(Controller, RouteKey);
  if (!routeMap) {
    return;
  }

  const controller = getInstance(app, Controller);

  for (let m in routeMap) {
    const route = routeMap[m];
    route.handler = controller[m].bind(controller);
    if (!route.url) {
      const context = getMetadata(Controller, ContextKey) || { name: 'unkown' };
      throw new Error(`PikeError: Could not resolve route for controller method: ${context.name}`);
    }
    app.log.debug(`Registering route at ${m} ${route}`);
    app.route(route);
  }
};

const loadRoutesFromModule = (app: PikeServer, controllerModule: any) => {
  for (let exp in controllerModule) {
    loadRoute(app, controllerModule[exp]);
  }
};

export const loadControllers = async (app: PikeServer) => {
  const config = getConfig(app);

  const { globs, routes } = config.controllers.reduce((memo, cfg) => {
    if (typeof cfg === 'string') {
      memo.globs.push(cfg);
    } else {
      memo.routes.push(cfg);
    }
    return memo;
  }, { globs: [], routes: [] } as any );

  const controllers = [...glob.sync(globs, { absolute: true, cwd: config.cwd }), ...routes];
  for (let i=0;i < controllers.length; i++) {
    let controller = controllers[i];
    if (typeof controller === 'string') {
      const controllerModule = await import(controller);
      loadRoutesFromModule(app, controllerModule);
    } else {
      loadRoute(app, controller);
    }
  }
};
