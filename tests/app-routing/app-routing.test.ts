import { bootstrapTestHarness, TestApp } from '@pikejs/test';
import { Get, Route, pike } from '@pikejs/server';
import { createApp } from './app/app-routing';

const createTestApp = bootstrapTestHarness(createApp);

describe('basic app creation', () => {
  let app: TestApp;
  beforeAll(async () => {
    app = await createTestApp();
  });

  /**
   * If this test fails, then the app is globbing for controllers outside of the app's cwd
   */
  it('should return a 404 for a not found route', async () => {
    const response = await app.request('/not-found');
    expect(response.statusCode).toEqual(404);
  });

  it('should connect a controller by passing a class reference into the array', async () => {
    const response = await app.request('/class-reference');
    expect(response.body).toEqual({hello: 'world'});
  });

  it('should connect a controller by passing a glob string to search for the file', async () => {
    const response = await app.request('/file-reference');
    expect(response.body).toEqual({hello: 'world'});
  });

  it('should connect multiple routes from the same file', async () => {
    const response = await app.request('/file-reference-2');
    expect(response.body).toEqual({hello: 'world'});
  });
});

describe('app route definition', () => {

  const testRoute = (route: any) => bootstrapTestHarness(() => pike({ controllers: [route] }))();

  describe('Route decorator namespacing', () => {
    let app: TestApp;
    beforeAll(async () => {
      @Route('/namespace')
      class Controller {
        @Get()
        async get() { return { hello: 'world' }; }

        @Get('/foo')
        async getFoo() { return { hello: 'world' }; }
      }
      app = await testRoute(Controller);
    });

    it('should apply the route decorator namespace to the app', async () => {
      const response = await app.request('/namespace');
      expect(response.body).toEqual({hello: 'world'});
    });

    it('should combine the namespace with the method decorator', async () => {
      const response = await app.request('/namespace/foo');
      expect(response.body).toEqual({hello: 'world'});
    });
  });

  describe('Route Controller class', () => {
    let app: TestApp;
    beforeAll(async () => {
      @Route('/')
      class Controller {
        state: string;
        constructor() { this.state = 'bar'; }

        @Get()
        async get() { return { hello: this.noDecorator() }; }

        @Get('/state')
        async getState() { return { hello: this.state }; }

        noDecorator() { return 'foo'; }
      }

      app = await testRoute(Controller);
    });

    it('should bind the controller method to the instance', async () => {
      const response = await app.request('/');
      expect(response.body).toEqual({hello: 'foo'});
    });

    it('should run the constructor', async () => {
      const response = await app.request('/state');
      expect(response.body).toEqual({hello: 'bar'});
    });
  });

  describe('Framework Error States', () => {
    it('should handle a route method without the route class decorator', async () => {
      class Controller {
        @Get('/')
        async get() { return { hello: 'world' }; }
      }
      const app = await testRoute(Controller);

      const response = await app.request('/');
      expect(response.body).toEqual({hello: 'world'});
    });

    it('should handle a route method and class with no defined paths', async () => {
      @Route()
      class Controller {
        @Get()
        async get() { return { hello: 'world' }; }
      }
      const app = await testRoute(Controller);

      const response = await app.request('/');
      expect(response.body).toEqual({hello: 'world'});
    });
  });
});
