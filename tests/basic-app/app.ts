import { pike, Get, Route } from '@pike/server';

@Route()
class IndexRoute {
  @Get('/')
  async getIndex() {
    return { hello: 'world' };
  }
}

export async function createApp() {
  const app = await pike({
    routes: [IndexRoute]
  });

  return app;
}
