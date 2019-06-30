import { Head, pike, PikeRequest } from '@pikejs/server';
import { bootstrapTestHarness } from '@pikejs/test';


describe('Head decorator', () => {
  const testRoute = (route: any) => bootstrapTestHarness(() => pike({ controllers: [route] }))();

  it('should support dynamic segments', async () => {
    class Controller {
      @Head(':id')
      async get(request: PikeRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request({ url: '/foo', method: 'HEAD' });
    expect(response.body).toEqual({hello: 'foo'});
  });
});
