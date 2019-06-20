import fastify from 'fastify';
import { IncomingMessage, ServerResponse, Server } from 'http';

export type PikeServer = fastify.FastifyInstance<Server, IncomingMessage, ServerResponse>
