import { posix } from 'path';
import { getMetadata, setMetadata } from '@rackify/config';
import { RouteKey, ContextKey } from '../keys';
import { getDecoratedFunc } from './injection';

enum RequestMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
  OPTIONS,
  HEAD,
}

function getContextFileName() {
  let stack;
  let pst = Error.prepareStackTrace;

  Error.prepareStackTrace = function (_, stack) {
    Error.prepareStackTrace = pst;
    return stack;
  };

  stack = ((new Error()).stack) as unknown as any[] || [];

  for (let i = 0;i < stack.length || i > 20;i++) {
    let frame = stack[i];
    let file = frame && frame.getFileName();
    if (file && file !== __filename) {
      return file;
    }
  }

  return 'unknown file';
}

const createRequestMappingDecorator = (requestMethod: RequestMethod) => (path: string = '') => (
  target: any,
  key: string
) => {
  const routeData = getMetadata(target.constructor, RouteKey) || {};
  const method = RequestMethod[requestMethod];
  const handler = getDecoratedFunc(target, key);
  const name = `${target.constructor.name}.${key}`;
  let url = posix.join(path);
  if (!/^\//i.test(url)) {
    url = `/${url}`;
  }
  setMetadata(target, ContextKey, { name, key, file: getContextFileName() });
  setMetadata(target.constructor, RouteKey, {
    ...routeData,
    [key]: { method, url, handler }
  });
};

export const Get = createRequestMappingDecorator(RequestMethod.GET);
export const Post = createRequestMappingDecorator(RequestMethod.POST);
export const Put = createRequestMappingDecorator(RequestMethod.PUT);
export const Patch = createRequestMappingDecorator(RequestMethod.PATCH);
export const Delete = createRequestMappingDecorator(RequestMethod.DELETE);
export const Options = createRequestMappingDecorator(RequestMethod.OPTIONS);
export const Head = createRequestMappingDecorator(RequestMethod.HEAD);

export const Route = (path: string = '') => (constructor: Function) => {
  const routeData = getMetadata(constructor, RouteKey);
  Object.keys(routeData)
    .forEach((routeKey) => {
      const route = routeData[routeKey];
      let url = posix.join(path, route.url);
      if (!/^\//i.test(url)) {
        url = `/${url}`;
      }
      routeData[routeKey] = { ...route, url };
    });

  setMetadata(constructor, RouteKey, routeData);
};
