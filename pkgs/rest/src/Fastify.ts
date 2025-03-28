import fastify, {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify';
import cors from '@fastify/cors';
import { getConfigFromEnv, useEnv } from '@wb/env';
import { fastifyLogger, logErrorAndThrow, logInfo } from '@wb/log';
import { getIPFromReq } from './utils/get-ip-from-req';
import type { Request } from 'express';
import https from 'https';
import { useContext } from './store/store';
import { randomUUID } from 'node:crypto';
import url from 'url';
import http from 'http';
import { createTerminus } from '@godaddy/terminus';

const env = useEnv();

export function useFastify() {
  const { enterWith } = useContext();

  const { logger } = fastifyLogger();

  const app = fastify({
    serverFactory,
    logger,
  });

  app.register(cors, getConfigFromEnv('CORS_'));

  app.addHook('onRequest', (request, reply, done) => {
    enterWith({
      requestId: request.headers['x-request-id'] || randomUUID(),
      ip: getIPFromReq(request.raw as Request),
      request,
      reply,
      done,
    });
  });

  app.addHook('onRequest', requestStart);
  app.addHook('onResponse', requestEnd);

  return { app, startServer };

  function requestStart(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) {
    request.startTime = process.hrtime();

    const socket = request.raw.socket;

    socket.metrics = socket.metrics || {
      in: socket.bytesRead,
      out: socket.bytesWritten,
    };

    done();
  }

  function requestEnd(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) {
    const socket = request.raw.socket;
    const startTime: [number, number] = request.startTime;
    const elapsed = process.hrtime(startTime);
    const elapsedMs = (elapsed[0] * 1e9 + elapsed[1]) / 1e6;

    const prevIn = socket.metrics?.in || 0;
    const prevOut = socket.metrics?.out || 0;
    const metrics = {
      in: socket.bytesRead - prevIn,
      out: socket.bytesWritten - prevOut,
    };

    socket.metrics = { in: socket.bytesRead, out: socket.bytesWritten };

    const protocol = app.server instanceof https.Server ? 'https' : 'http';
    const parsedUrl = url.parse(request.raw.url || request.url, true);

    const logData = {
      request: {
        method: request.method,
        url: request.raw.url,
        path: parsedUrl.pathname,
        protocol,
        host: request.headers.host,
        size: metrics.in,
        query: parsedUrl.query,
        headers: request.headers,
        ip: getIPFromReq(request.raw),
      },
      response: {
        status: reply.statusCode,
        size: metrics.out,
        headers: reply.getHeaders(),
      },
      duration: elapsedMs.toFixed(),
    };

    logInfo(JSON.stringify(logData, null, 2));

    done();
  }

  function serverFactory(handler: http.RequestListener) {
    const env = useEnv();

    const { shutdownTimeout } = getConfigFromEnv('SERVER_');

    const server = env.HTTPS
      ? https.createServer({}, handler)
      : http.createServer(handler);

    createTerminus(server, {
      healthChecks: { '/health': () => Promise.resolve() },
      timeout:
        typeof shutdownTimeout === 'number' &&
        shutdownTimeout >= 0 &&
        shutdownTimeout < Infinity
          ? shutdownTimeout
          : 1000,
      signals: ['SIGINT', 'SIGTERM', 'SIGHUP'],
      beforeShutdown: async () => {
        if (env.isProduction) {
          logInfo('Начало отключения сервера...');
        }
      },
      onSignal: async () => {
        logInfo('Закрываем соединения с БД');
      },
      onShutdown: async () => {
        if (env.isProduction) {
          logInfo('Сервер завершил работу. До свидания!');
        }
      },
    });

    return server;
  }

  async function startServer(): Promise<void> {
    const host = env['HOST'] || '0.0.0.0';
    const port = parseInt(<string>env['PORT'] || '3000', 10);
    const socketPath = env['UNIX_SOCKET_PATH'] as string | undefined;

    app.listen(
      socketPath ? { path: socketPath } : { host, port },
      (err, address) => {
        if (err) logErrorAndThrow(err);

        logInfo(
          `Сервер запущен по ${socketPath ? 'сокету' : 'адресу'} ${address}`
        );

        process.send?.('ready');
      }
    );
  }
}
