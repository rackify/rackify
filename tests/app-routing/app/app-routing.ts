import { pike, Get, Route, getRequestContext } from '@pike/server';

@Route()
class IndexRoute {
  @Get('/class-reference')
  async getIndex() {
    return { hello: 'world' };
  }
}

@Route('/')
class ContextRoute {
  @Get()
  async get(request: any) {
    const { request: req } = getRequestContext();
    return { isTheSame: req === request };
  }
}

export async function createApp() {
  const app = await pike({
    controllers: [ContextRoute, IndexRoute, '**/*.controller.ts'],
    cwd: __dirname
  });

  return app;
}
