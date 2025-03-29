import { logErrorAndExit } from '@dime/log';

import { Fastify } from '@dime/rest';

const { host, port } = parseEnv('SERVICE_');

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
