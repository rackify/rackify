import fastify from 'fastify';
import { PikeServer } from '@pikejs/server';

type TestRequestOptions = Partial<fastify.HTTPInjectOptions> | string;

export interface TestRequestResponse extends fastify.HTTPInjectResponse {
  body: any
}

export interface TestApp {
  request: (opts?: TestRequestOptions) => Promise<TestRequestResponse>
  app: any;
}

export type CreateAppFunc = () => Promise<PikeServer>;

const tryParse = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch (err) {
    return payload;
  }
};

export function bootstrapTestHarness(createApp: CreateAppFunc) {
  return async function createTestApp(): Promise<TestApp> {
    const app = await createApp();

    const appRequest = async (opts: TestRequestOptions = {}) => {
      if (typeof opts === 'string') {
        opts = { url: opts };
      }

      const response = await app.inject({
        method: 'GET',
        url: '/',
        ...opts
      }) as TestRequestResponse;

      response.body = tryParse(response.payload);

      return response;
    };

    return { app, request: appRequest };
  };
}
