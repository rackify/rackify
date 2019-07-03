import 'reflect-metadata';
import { getMetadata, setMetadata } from '@rackify/config';
import { DecoratedFunc } from '../keys';
import { getRequestContext } from '../context';

type AnyFunc = (...args: any[]) => any;

const getDecoratedFuncMap = (target: any): Map<string, AnyFunc> => {
  let decoratedFuncMap = getMetadata(target, DecoratedFunc);
  if (!decoratedFuncMap) {
    decoratedFuncMap = new Map();
    setMetadata(target, DecoratedFunc, decoratedFuncMap);
  }

  return decoratedFuncMap;
};

const getDecoratedFunc = (target: any, key: string): AnyFunc => {
  let decoratedFuncMap = getDecoratedFuncMap(target);

  let injectedFunc: any = decoratedFuncMap.get(key);
  if (!injectedFunc) {
    injectedFunc = target[key];
  }

  return injectedFunc;
};

const setDecoratedFunc = (target: any, key: string, fn: AnyFunc): AnyFunc => {
  let decoratedFuncMap = getDecoratedFuncMap(target);

  decoratedFuncMap.set(key, fn);
  return fn;
};

const injectArg = (target: any, key: string, index: number, argGetter: () => any) => {
  const injectedFunc = getDecoratedFunc(target, key);

  const newFunc = function(this: any, ...args: any[]) {
    const context = this || target;
    let value = argGetter();
    return injectedFunc.apply(
      context,
      [...args.slice(0, index), value, ...args.slice(index + 1)]
    );
  };

  target[key] = newFunc;
  setDecoratedFunc(target, key, newFunc);

  return injectedFunc;
};

export const Param = (name: string) => (
  target: any,
  key: string,
  index: number
) => {
  injectArg(target, key, index, () => {
    const { request } = getRequestContext();
    return request.params[name];
  });
};

export const Query = (name: string) => (
  target: any,
  key: string,
  index: number
) => {
  injectArg(target, key, index, () => {
    const { request } = getRequestContext();
    return request.query[name];
  });
};
