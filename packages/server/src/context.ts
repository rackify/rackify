import { createNamespace, getNamespace } from './namespace';
import { RackifyRequest, RackifyReply } from './types';

const CONTEXT_KEY = 'context';

export interface RequestContext {
  request: RackifyRequest
  reply: RackifyReply
}

export const getContextNamespace = () => {
  const ns = getNamespace('request-context');
  return ns ? ns : createNamespace('request-context');
};

export const getRequestContext = () => {
  const requestContext = getContextNamespace().get(CONTEXT_KEY);
  if (!requestContext) {
    throw new Error('RackifyError: Unable to resolve the request context');
  }

  return requestContext as RequestContext;
};

export const setRequestContext = (request: RackifyRequest, reply: RackifyReply) => {
  const requestContext: RequestContext = {
    request,
    reply
  };
  getContextNamespace().set(CONTEXT_KEY, requestContext);
  return requestContext;
};
