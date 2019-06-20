import 'reflect-metadata';

export const RouteKey = Symbol('route-definition');
const GetKey = Symbol('GET');

export const Get = (url: string) => (target: any, key: string, descriptor: PropertyDescriptor) => {
  const currentMetadata = Reflect.getOwnMetadata(RouteKey, target.constructor) || {};
  Reflect.defineMetadata(RouteKey, {
    ...currentMetadata,
    GET: {
      method: 'GET',
      url,
      handler: target[key].bind(target)
    }
  }, target.constructor);
};

export const Route = (path: string = '') => (constructor: Function) => {
  // Reflect.defineMetadata(RouteKey, path, constructor);
};
