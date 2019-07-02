import { setMetadata, getMetadata } from '@rackify/config';

import { RackifyServer } from './types';
import { ContainerKey, AppKey } from './keys';

export const initializeServices = (app: RackifyServer) => {
  setMetadata(app, ContainerKey, new Map());
};

export const getInstance = (app: RackifyServer, Constructor: any) => {
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
