import { posix } from 'path';
import { getMetadata, setMetadata } from '@pike/config';
import { RouteKey, ContextKey } from './keys';

enum RequestMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
  ALL,
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

const createRequestMappingDecorator = (requestMethod: RequestMethod) => (url: string = '') => (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => {
  const routeData = getMetadata(target.constructor, RouteKey) || {};
  const method = RequestMethod[requestMethod];
  const handler = target[key].bind(target);
  const name = `${target.constructor.name}.${key}`;

  setMetadata(target, ContextKey, { name, key, file: getContextFileName() });
  setMetadata(target.constructor, RouteKey, {
    ...routeData,
    [key]: { method, url: posix.join(url), handler }
  });
};

export const Get = createRequestMappingDecorator(RequestMethod.GET);
export const Post = createRequestMappingDecorator(RequestMethod.POST);
export const Put = createRequestMappingDecorator(RequestMethod.PUT);
export const Delete = createRequestMappingDecorator(RequestMethod.DELETE);
export const All = createRequestMappingDecorator(RequestMethod.ALL);
export const Options = createRequestMappingDecorator(RequestMethod.OPTIONS);
export const Head = createRequestMappingDecorator(RequestMethod.HEAD);

export const Route = (path: string = '') => (constructor: Function) => {
  const routeData = getMetadata(constructor, RouteKey);
  Object.keys(routeData)
    .forEach((routeKey) => {
      const route = routeData[routeKey];
      const url = posix.join(path, route.url);
      routeData[routeKey] = { ...route, url };
    });

  setMetadata(constructor, RouteKey, routeData);
};
