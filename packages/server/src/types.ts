import fastify from 'fastify';
import { IncomingMessage, ServerResponse, Server } from 'http';

export type PikeServer = fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>

export interface PikeRequest extends fastify.FastifyRequest {}
export interface PikeReply extends fastify.FastifyReply<ServerResponse> {}
