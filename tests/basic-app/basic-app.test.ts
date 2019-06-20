import { bootstrapTestHarness, TestApp } from '@pike/test';
import { createApp } from './app';

const createTestApp = bootstrapTestHarness(createApp);

describe('basic app creation', () => {
  let app: TestApp;
  beforeAll(async () => {
    app = await createTestApp();
  });

  it('should create a functioning app', async () => {
    await app.request('/');
  });
});
