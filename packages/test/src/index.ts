import fastify from 'fastify';
import { PikeServer } from '@pike/server';

type TestRequestOptions = Partial<fastify.HTTPInjectOptions> | string;

export interface TestApp {
    request: (opts?: TestRequestOptions) => Promise<fastify.HTTPInjectResponse>
    app: any;
}

export type CreateAppFunc = () => Promise<PikeServer>;

export function bootstrapTestHarness(createApp: CreateAppFunc) {
  return async function createTestApp(): Promise<TestApp> {
    const app = await createApp();

    const appRequest = async (opts: TestRequestOptions = {}) => {
      if (typeof opts === 'string') {
        opts = { url: opts };
      }

      const request = app.inject({
        method: 'GET',
        url: '/',
        ...opts
      });

      return request;
    };

    return { app, request: appRequest };
  };
}
