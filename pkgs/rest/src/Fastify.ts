import http from 'http';
import https from 'https';
import url from 'url';
import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { createTerminus, TerminusOptions } from '@godaddy/terminus';
import { getConfigFromEnv, useEnv } from '@wb/env';
import { createFastifyLogger, logError, logInfo } from '@wb/log';
import { getIPFromReq } from './utils/get-ip-from-req';

const env = useEnv();

const app: FastifyInstance = fastify({
  logger: createFastifyLogger().logger,
  serverFactory: (handler) => {
    // Создаем сервер, применяя конфигурацию из env
    const server = http.createServer(handler);
    Object.assign(server, getConfigFromEnv('SERVER_'));
    return server;
  },
});

// Регистрируем CORS и другие плагины
app.register(cors);

// Хук для захвата времени начала запроса и исходных метрик сокета
app.addHook('onRequest', (request, reply, done) => {
  (request as any).startTime = process.hrtime();
  const socket = request.raw.socket;
  socket._metrics = socket._metrics || {
    in: socket.bytesRead,
    out: socket.bytesWritten,
  };
  done();
});

// Хук для логирования после завершения обработки запроса
app.addHook('onResponse', (request, reply, done) => {
  const socket = request.raw.socket;
  const startTime: [number, number] = (request as any).startTime;
  const elapsed = process.hrtime(startTime);
  const elapsedMs = (elapsed[0] * 1e9 + elapsed[1]) / 1e6;

  const prevIn = socket._metrics?.in || 0;
  const prevOut = socket._metrics?.out || 0;
  const metrics = {
    in: socket.bytesRead - prevIn,
    out: socket.bytesWritten - prevOut,
  };
  socket._metrics = { in: socket.bytesRead, out: socket.bytesWritten };

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
});

// Опции graceful shutdown через terminus
const terminusOptions: TerminusOptions = {
  timeout:
    typeof env['SERVER_SHUTDOWN_TIMEOUT'] === 'number' &&
    env['SERVER_SHUTDOWN_TIMEOUT'] >= 0 &&
    env['SERVER_SHUTDOWN_TIMEOUT'] < Infinity
      ? env['SERVER_SHUTDOWN_TIMEOUT']
      : 1000,
  signals: ['SIGINT', 'SIGTERM', 'SIGHUP'],
  beforeShutdown: async () => {
    if (env['NODE_ENV'] !== 'development') {
      logInfo('Начало отключения сервера...');
    }
  },
  onSignal: async () => {
    logInfo('Закрываем соединения с БД');
  },
  onShutdown: async () => {
    if (env['NODE_ENV'] !== 'development') {
      logInfo('Сервер завершил работу. До свидания!');
    }
  },
};

createTerminus(app.server, terminusOptions);

// Определяем параметры прослушивания из env
const host = env['HOST'] || '0.0.0.0';
const port = parseInt(env['PORT'] || '3000', 10);
const socketPath = env['UNIX_SOCKET_PATH'] as string | undefined;

// Запуск сервера
if (socketPath) {
  app.listen({ path: socketPath }, (err, address) => {
    if (err) {
      logError(err);
      process.exit(1);
    }
    logInfo(`Сервер запущен по сокету ${address}`);
    process.send?.('ready');
  });
} else {
  app.listen({ host, port }, (err, address) => {
    if (err) {
      logError(err);
      process.exit(1);
    }
    logInfo(`Сервер запущен по адресу ${address}`);
    process.send?.('ready');
  });
}

export default app;
