import { createNamespace, getNamespace } from './namespace';
import { PikeRequest, PikeReply } from './types';

const CONTEXT_KEY = 'context';

export interface RequestContext {
  request: PikeRequest
  reply: PikeReply
}

export const getContextNamespace = () => {
  const ns = getNamespace('request-context');
  return ns ? ns : createNamespace('request-context');
};

export const getRequestContext = () => {
  const requestContext = getContextNamespace().get(CONTEXT_KEY);
  if (!requestContext) {
    throw new Error('PikeError: Unable to resolve the request context');
  }

  return requestContext as RequestContext;
};

export const setRequestContext = (request: PikeRequest, reply: PikeReply) => {
  const requestContext: RequestContext = {
    request,
    reply
  };
  getContextNamespace().set(CONTEXT_KEY, requestContext);
  return requestContext;
};
