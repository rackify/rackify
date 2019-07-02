import { Get, Route } from '@rackify/server';

@Route()
export class FileReferenceRoute {
  @Get('/file-reference')
  async getIndex() {
    return { hello: 'world' };
  }
}

@Route()
export class FileReferenceSecondRoute {
  @Get('/file-reference-2')
  async getIndex() {
    return { hello: 'world' };
  }
}
