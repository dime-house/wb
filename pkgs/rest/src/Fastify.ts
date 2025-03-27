import { IncomingMessage, Server, ServerResponse } from 'node:http';
import fastify, { FastifyInstance } from 'fastify';
import { createFastifyLogger } from '@wb/log';
import cors from '@fastify/cors';
import { fastifyRequestContext } from './Context';

export const Fastify: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  fastify({
    loggerInstance: createFastifyLogger().logger,
  })
    .register(cors)
    .register(fastifyRequestContext, {
      defaultStoreValues: {
        user: { id: 'system' },
      },
    })
    .addHook('onRequest', (req, reply, done) => {
      // Overwrite the defaults.
      // This is completely equivalent to using app.requestContext or just requestContext
      req.requestContext.set('user', { id: 'helloUser' });
      done();
    });
