import { Put, rackify, RackifyRequest } from '@rackify/server';
import { bootstrapTestHarness } from '@rackify/test';


describe('Put decorator', () => {
  const testRoute = (route: any) => bootstrapTestHarness(() => rackify({ controllers: [route] }))();

  it('should support dynamic segments', async () => {
    class Controller {
      @Put(':id')
      async get(request: RackifyRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request({ url: '/foo', method: 'PUT' });
    expect(response.body).toEqual({hello: 'foo'});
  });
});
