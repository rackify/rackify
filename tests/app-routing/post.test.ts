import { Post, rackify, RackifyRequest } from '@rackify/server';
import { bootstrapTestHarness } from '@rackify/test';


describe('Post decorator', () => {
  const testRoute = (route: any) => bootstrapTestHarness(() => rackify({ controllers: [route] }))();

  it('should support dynamic segments', async () => {
    class Controller {
      @Post(':id')
      async get(request: RackifyRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request({ url: '/foo', method: 'POST' });
    expect(response.body).toEqual({hello: 'foo'});
  });

  it('should accept a route config object', async () => {
    class Controller {
      @Post({url: ':id'})
      async get(request: RackifyRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request({ url: '/foo', method: 'POST' });
    expect(response.body).toEqual({hello: 'foo'});
  });

  it('should accept a route config schema', async () => {
    class Controller {
      @Post({url: ':id', schema: {
        body: {
          type: 'object',
          properties: {
            foo: { type: 'string' }
          },
          required: ['foo']
        }
      }})
      async post(request: RackifyRequest) {
        return { hello: request.params.id };
      }
    }
    const app = await testRoute(Controller);

    const response = await app.request({ url: '/foo', method: 'POST', payload: {} });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: 'body should have required property \'foo\'',
      statusCode: 400
    });
  });
});
