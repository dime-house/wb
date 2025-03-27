import http, { IncomingMessage, Server, ServerResponse } from 'node:http';
import fastify, { FastifyInstance } from 'fastify';
import { createFastifyLogger, logError, logInfo } from '@wb/log';
import cors from '@fastify/cors';
import { AsyncResource } from 'node:async_hooks';
import {
  asyncResourceSymbol,
  createAsyncResource,
  ctx,
  defaultStoreValues,
  hasDefaultStoreValuesFactory,
  hook,
} from './Context';
import { createServer } from './Server';
import type { ListenOptions } from 'net';
import https from 'https';

export const Fastify: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  fastify({
    serverFactory: (
      fn: (request: http.IncomingMessage, response: http.ServerResponse) => void
    ) => {
      const server = await createServer(fn);

      const host = env['HOST'] as string;
      const path = env['UNIX_SOCKET_PATH'] as string | undefined;
      const port = env['PORT'] as string;

      let listenOptions: ListenOptions;

      if (path) {
        listenOptions = { path };
      } else {
        listenOptions = {
          host,
          port: parseInt(port),
        };
      }

      server
        .listen(listenOptions, () => {
          const protocol = server instanceof https.Server ? 'https' : 'http';

          logInfo(
            `Server started at ${
              listenOptions.port
                ? `${protocol}://${getAddress(server)}`
                : getAddress(server)
            }`
          );

          process.send?.('ready');
        })
        .once('error', (err: any) => {
          if (err?.code === 'EADDRINUSE') {
            logError(
              `${
                listenOptions.port
                  ? `Port ${listenOptions.port}`
                  : getAddress(server)
              } is already in use`
            );
            process.exit(1);
          } else {
            throw err;
          }
        });

      return server;
    },
    loggerInstance: createFastifyLogger().logger,
  });

Fastify.register(cors)
  .decorate('ctx', ctx)
  .decorateRequest('ctx', { getter: () => ctx })
  .decorateRequest(asyncResourceSymbol, null);

Fastify.addHook('onRequest', (req, _res, done) => {
  const defaults = hasDefaultStoreValuesFactory
    ? defaultStoreValues(req)
    : defaultStoreValues;

  asyncLocalStorage.run({ ...defaults }, () => {
    const asyncResource =
      createAsyncResource != null
        ? createAsyncResource(req, ctx)
        : new AsyncResource('context');
    req[asyncResourceSymbol] = asyncResource;
    asyncResource.runInAsyncScope(done, req.raw);
  });
});

if (hook === 'onRequest' || hook === 'preParsing') {
  Fastify.addHook('preValidation', (req, _res, done) => {
    const asyncResource = req[asyncResourceSymbol];
    asyncResource.runInAsyncScope(done, req.raw);
  });
}
