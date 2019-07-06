import glob from 'fast-glob';
import { getConfig, getMetadata } from '@rackify/config';

import { RouteKey, ContextKey } from './keys';
import { RackifyServer } from './types';
import { getInstance } from './services';


const loadRoute = (app: RackifyServer, Controller: any) => {
  if (typeof Controller !== 'function') {
    return;
  }

  const routeMap = getMetadata(Controller, RouteKey);
  if (!routeMap) {
    return;
  }

  const controller = getInstance(app, Controller);

  for (let key in routeMap) {
    const route = routeMap[key];
    route.handler = route.handler.bind(controller);
    // need to get the metadata from the Controller and look for the context metadata
    const context = getMetadata(controller, ContextKey);

    if (!context) {
      throw new Error(`Internal RackifyError: Could not find context data for controller: ${Controller}`);
    }

    if (!route.url || route.url === '.') {
      throw new Error(`RackifyError: Could not resolve route for controller method: ${context.name} in ${context.file}\nDid you forget to define a route in either the 'Route' or method decorators?`);
    }

    app.fastify.log.debug(`Registering route at ${key} ${route}`);
    app.fastify.route(route);
  }
};

const loadRoutesFromModule = (app: RackifyServer, controllerModule: any) => {
  for (let exp in controllerModule) {
    loadRoute(app, controllerModule[exp]);
  }
};

export const loadControllers = async (app: RackifyServer) => {
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
