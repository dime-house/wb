try {
  Fastify.register(domains);

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
