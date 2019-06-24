import { Delete, pike, PikeRequest } from '@pike/server';
import { bootstrapTestHarness } from '@pike/test';


describe('Delete decorator', () => {
  const testRoute = (route: any) => bootstrapTestHarness(() => pike({ controllers: [route] }))();

  it('should support dynamic segments', async () => {
    class Controller {
      @Delete(':id')
      async get(request: PikeRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request({ url: '/foo', method: 'DELETE' });
    expect(response.body).toEqual({hello: 'foo'});
  });
});
