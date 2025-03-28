import { pino, stdSerializers } from 'pino';
import { httpPrintFactory } from 'pino-http-print';
import { pinoHttp } from 'pino-http';

const level = process.env['log_level'] || 'trace';

export function fastifyLogger() {
  return pinoHttp({
    logger: pino(
      {
        level,
        serializers: {
          user: (request) => stdSerializers.req(request),
        },
      },
      pino.multistream({
        level,
        stream: httpPrintFactory({
          all: true,
          translateTime: 'SYS:HH:MM:ss',
          relativeUrl: true,
          prettyOptions: {
            ignore: 'hostname,pid',
            sync: true,
          },
        })(),
      })
    ),
  });
}
