import { pike, Get, Route } from '@pike/server';

@Route()
class IndexRoute {
  @Get('/class-reference')
  async getIndex() {
    return { hello: 'world' };
  }
}

export async function createApp() {
  const app = await pike({
    controllers: [IndexRoute, '**/*.controller.ts'],
    cwd: __dirname
  });

  return app;
}
