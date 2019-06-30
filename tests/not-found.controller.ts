import { Get, Route } from '@pikejs/server';

// This route is not intentionally loaded by any of the testing apps, it's here to catch
// any unexpected behavior from the file globbing
@Route()
export class FileReferenceRoute {
  @Get('/not-found')
  async getIndex() {
    return { hello: 'world' };
  }
}
