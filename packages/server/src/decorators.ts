import { posix } from 'path';
import { getMetadata, setMetadata } from '@rackify/config';
import { RouteKey, ContextKey, InjectedArgs } from './keys';
import { getRequestContext } from './context';

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
  const handler = target[key].bind(target);
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

const getInjectedArgs = (target: any, key: string) => {
  let injectedArgMap = getMetadata(target, InjectedArgs);
  if (!injectedArgMap) {
    injectedArgMap = new Map();
    setMetadata(target, InjectedArgs, injectedArgMap);
  }

  let injectedArgs: any[] = injectedArgMap.get(key);
  if (!injectedArgs) {
    injectedArgs = [];
    injectedArgMap.set(key, injectedArgs);
  }

  return injectedArgs;
};

const injectArg = (target: any, key: string, descriptor: PropertyDescriptor, argGetter: () => any) => {
  let injectedArgs = getInjectedArgs(target, key);
  // If there are no args, then we need to decorate the method, otherwise we can assume the
  // method has already been decorated
  if (!injectedArgs.length) {
    const original = descriptor.value;
    descriptor.value = function(...originalArgs: any[]) {
      const newArgs = [
        ...getInjectedArgs(target, key).map((fn: () => any) => fn()),
        ...originalArgs
      ];
      return original.apply(target, newArgs);
    };
  }

  injectedArgs.unshift(argGetter);
  return descriptor;
};

export const Param = (name: string, defaultValue: any = null) => (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => {
  return injectArg(target, key, descriptor, () => {
    const { request } = getRequestContext();
    const value = request.params[name];

    return typeof value === 'undefined' ? defaultValue : value;
  });
};

export const Query = (name: string, defaultValue: any = null) => (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => {
  return injectArg(target, key, descriptor, () => {
    const { request } = getRequestContext();
    const value = request.query[name];

    return typeof value === 'undefined' ? defaultValue : value;
  });
};
