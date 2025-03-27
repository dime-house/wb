import { Fastify } from './Fastify';
import { logError } from '@wb/log';
import { FastifyInstance } from 'fastify';

export async function listen(
  routers: any[],
  options
): Promise<FastifyInstance> {
  try {
    for (const router of routers) {
      Fastify.register(router);
    }

    await Fastify.listen({
      listenTextResolver: (address: string) => {
        return `Сервер запущен на ${address}`;
      },
      port: parseInt(options['port'], 10),
      host: options['host'],
    });
  } catch (err) {
    logError('Ошибка запуска сервера:', err);
  }
}
