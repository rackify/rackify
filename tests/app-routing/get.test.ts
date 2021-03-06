import { Get, rackify, RackifyRequest, Param, Query } from '@rackify/server';
import { bootstrapTestHarness } from '@rackify/test';

describe('Get decorator', () => {
  const testRoute = (route: any) => bootstrapTestHarness(() => rackify({ controllers: [route] }))();

  it('should support dynamic segments', async () => {
    class Controller {
      @Get(':id')
      async get(request: RackifyRequest) {
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
      async get(@Param('nada') nada: any, @Param('id') id: string) {
        if (typeof id !== 'string') {
          throw new Error('id param did not decorate correctly');
        }
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
      async get(@Param('id') id: string, @Query('nada') nada: any) {
        return { hello: nada };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request('/foo?nada=bar');
    expect(response.body).toEqual({hello: 'bar'});
  });
});
