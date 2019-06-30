import { Get, pike, PikeRequest, Param, Query } from '@pikejs/server';
import { bootstrapTestHarness } from '@pikejs/test';

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

  it('should be able to utilize the Param decorator', async () => {
    class Controller {
      @Get(':id')
      @Param('nada')
      @Param('id')
      async get(nada: any, id: string) {
        return { hello: id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request('/foo');
    expect(response.body).toEqual({hello: 'foo'});
  });

  it('should be able to utilize Query decorator', async () => {
    class Controller {
      @Get(':id')
      @Param('id')
      @Query('nada')
      async get(id: string, nada: any) {
        return { hello: nada };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request('/foo?nada=bar');
    expect(response.body).toEqual({hello: 'bar'});
  });
});
