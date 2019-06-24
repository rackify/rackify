import { Options, pike, PikeRequest } from '@pike/server';
import { bootstrapTestHarness } from '@pike/test';


describe('Options decorator', () => {
  const testRoute = (route: any) => bootstrapTestHarness(() => pike({ controllers: [route] }))();

  it('should support dynamic segments', async () => {
    class Controller {
      @Options(':id')
      async get(request: PikeRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request({ url: '/foo', method: 'OPTIONS' });
    expect(response.body).toEqual({hello: 'foo'});
  });
});
