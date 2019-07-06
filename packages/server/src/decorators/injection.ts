import 'reflect-metadata';
import { getMetadata, setMetadata } from '@rackify/config';
import { ParamInjection } from '../keys';
import { getRequestContext } from '../context';

type AnyFunc = (...args: any[]) => any;

const getDecoratedFunctionMap = (target: any): Map<string, AnyFunc> => {
  let decoratedFunctionMap = getMetadata(target, ParamInjection);
  if (!decoratedFunctionMap) {
    decoratedFunctionMap = new Map();
    setMetadata(target, ParamInjection, decoratedFunctionMap);
  }

  return decoratedFunctionMap;
};

export const getDecoratedFunc = (target: any, key: string): AnyFunc => {
  let decoratedFunctionMap = getDecoratedFunctionMap(target);

  let decoratedFunc = decoratedFunctionMap.get(key);
  if (!decoratedFunc) {
    decoratedFunc = function(this: any, ...args: any[]) {
      const context = this === global ? target : this;
      return target[key].apply(context, args);
    };
  }

  return decoratedFunc;
};

const setDecoratedFunc = (target: any, key: string, fn: AnyFunc): AnyFunc => {
  let decoratedFunctionMap = getDecoratedFunctionMap(target);

  decoratedFunctionMap.set(key, fn);
  return fn;
};

const injectArg = (target: any, key: string, index: number, argGetter: () => any) => {
  const injectionFunc = getDecoratedFunc(target, key);

  function paramInjector(this: any, ...args: any[]) {
    const context = this === global ? target : this;
    let value = argGetter();
    return injectionFunc.apply(
      context,
      [...args.slice(0, index), value, ...args.slice(index + 1)]
    );
  }

  setDecoratedFunc(target, key, paramInjector);

  return injectionFunc;
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
