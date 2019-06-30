import { setMetadata, getMetadata } from '@pikejs/config';

import { PikeServer } from './types';
import { ContainerKey, AppKey } from './keys';

export const initializeServices = (app: PikeServer) => {
  setMetadata(app, ContainerKey, new Map());
};

export const getInstance = (app: PikeServer, Constructor: any) => {
  const container = getMetadata(app, ContainerKey);

  let instance = container.get(Constructor);

  if (instance) {
    return instance;
  }

  instance = new Constructor(app);
  container.set(instance);
  setMetadata(instance, AppKey, app);

  return instance;
};
