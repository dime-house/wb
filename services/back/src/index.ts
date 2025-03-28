import { logErrorAndExit } from '@wb/log';

import { Fastify } from '@wb/rest';
import { getConfigFromEnv } from '@wb/env';

const { host, port } = getConfigFromEnv('SERVICE_');

try {
  Fastify.register(router);

  await Fastify.listen({
    listenTextResolver: (address: string) => {
      return `Сервер запущен на ${address}`;
    },
    port,
    host,
  });
} catch (err) {
  logErrorAndExit('Ошибка запуска сервера:', err);
}
