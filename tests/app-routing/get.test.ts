import { Get, pike, PikeRequest } from '@pike/server';
import { bootstrapTestHarness } from '@pike/test';


describe('Get decorator', () => {
  const testRoute = (route: any) => bootstrapTestHarness(() => pike({ controllers: [route] }))();

  it('should support dynamic segments', async () => {
    class Controller {
      @Get(':id')
      async get(request: PikeRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request('/foo');
    expect(response.body).toEqual({hello: 'foo'});
  });
});
