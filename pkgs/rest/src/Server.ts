import http from 'http';
import type { Request } from 'express';
import https from 'https';
import url from 'url';
import qs from 'qs';
import { getConfigFromEnv, useEnv } from '@wb/env';
import { once } from 'lodash-es';
import { getIPFromReq } from './utils/get-ip-from-req';
import { createTerminus, TerminusOptions } from '@godaddy/terminus';
import { logInfo } from '@wb/log';

const env = useEnv();
export async function createServer<T>(
  requestListener: () => Promise<T>
): Promise<http.Server> {
  const server = http.createServer(await requestListener());

  Object.assign(server, parseEnv('SERVER_'));

  server.on(
    'request',
    function (req: http.IncomingMessage & Request, res: http.ServerResponse) {
      const startTime = process.hrtime();

      const complete = once(function (finished: boolean) {
        const elapsedTime = process.hrtime(startTime);
        const elapsedNanoseconds = elapsedTime[0] * 1e9 + elapsedTime[1];
        const elapsedMilliseconds = elapsedNanoseconds / 1e6;

        const previousIn = (req.socket as any)._metrics?.in || 0;
        const previousOut = (req.socket as any)._metrics?.out || 0;

        const metrics = {
          in: req.socket.bytesRead - previousIn,
          out: req.socket.bytesWritten - previousOut,
        };

        (req.socket as any)._metrics = {
          in: req.socket.bytesRead,
          out: req.socket.bytesWritten,
        };

        const protocol = server instanceof https.Server ? 'https' : 'http';

        const urlInfo = url.parse(req.originalUrl || req.url);

        const info = {
          finished,
          request: {
            aborted: req.aborted,
            completed: req.complete,
            method: req.method,
            url: urlInfo.href,
            path: urlInfo.pathname,
            protocol,
            host: req.headers.host,
            size: metrics.in,
            query: urlInfo.query ? qs.parse(urlInfo.query) : {},
            headers: req.headers,
          },
          response: {
            status: res.statusCode,
            size: metrics.out,
            headers: res.getHeaders(),
          },
          ip: getIPFromReq(req),
          duration: elapsedMilliseconds.toFixed(),
        };

        logInfo(JSON.stringify(info, null, 2));
      });

      res.once('finish', complete.bind(null, true));
      res.once('close', complete.bind(null, false));
    }
  );

  const terminusOptions: TerminusOptions = {
    timeout:
      (env['SERVER_SHUTDOWN_TIMEOUT'] as number) >= 0 &&
      (env['SERVER_SHUTDOWN_TIMEOUT'] as number) < Infinity
        ? (env['SERVER_SHUTDOWN_TIMEOUT'] as number)
        : 1000,
    signals: ['SIGINT', 'SIGTERM', 'SIGHUP'],
    beforeShutdown,
    onSignal,
    onShutdown,
  };

  createTerminus(server, terminusOptions);

  return server;

  async function beforeShutdown() {
    if (env['NODE_ENV'] !== 'development') {
      logInfo('Shutting down...');
    }
  }

  async function onSignal() {
    logInfo('Database connections destroyed');
  }

  async function onShutdown() {
    if (env['NODE_ENV'] !== 'development') {
      logInfo('Directus shut down OK. Bye bye!');
    }
  }
}
