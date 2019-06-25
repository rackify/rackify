import fastify, { HTTPInjectOptions, HTTPInjectResponse } from 'fastify';
import { IncomingMessage, ServerResponse, Server } from 'http';

type NodeCb = (err: Error, res: HTTPInjectResponse) => void;
export interface PikeServer {
  fastify: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>

  inject(opts: HTTPInjectOptions | string): Promise<HTTPInjectResponse>;
  inject(opts: HTTPInjectOptions | string, cb: NodeCb): void;
}

export interface PikeRequest extends fastify.FastifyRequest {}
export interface PikeReply extends fastify.FastifyReply<ServerResponse> {}
