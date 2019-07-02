import { Options, rackify, RackifyRequest } from '@rackify/server';
import { bootstrapTestHarness } from '@rackify/test';


describe('Options decorator', () => {
  const testRoute = (route: any) => bootstrapTestHarness(() => rackify({ controllers: [route] }))();

  it('should support dynamic segments', async () => {
    class Controller {
      @Options(':id')
      async get(request: RackifyRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request({ url: '/foo', method: 'OPTIONS' });
    expect(response.body).toEqual({hello: 'foo'});
  });
});
