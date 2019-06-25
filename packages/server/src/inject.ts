let lightMyRequest: any;
export async function injectRequest(...args: any[]) {
  // lightMyRequest is dynamically loaded as it seems very expensive
  // because of Ajv
  if (lightMyRequest === undefined) {
    lightMyRequest = await import('light-my-request');
  }

  return lightMyRequest.default(...args);
}
