import { AsyncLocalStorage, AsyncResource } from 'node:async_hooks';

const asyncResourceSymbol = Symbol('asyncResource');
const asyncLocalStorage = new AsyncLocalStorage();

const requestContext = {
  get: (key) => {
    const store = asyncLocalStorage.getStore();
    return store ? store[key] : undefined;
  },
  set: (key, value) => {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store[key] = value;
    }
  },
  getStore: () => {
    return asyncLocalStorage.getStore();
  },
};

export function fastifyRequestContext(fastify, opts, next) {
  fastify.decorate('requestContext', requestContext);
  fastify.decorateRequest('requestContext', { getter: () => requestContext });
  fastify.decorateRequest(asyncResourceSymbol, null);
  const hook = opts.hook || 'onRequest';
  const hasDefaultStoreValuesFactory =
    typeof opts.defaultStoreValues === 'function';

  fastify.addHook(hook, (req, _res, done) => {
    const defaultStoreValues = hasDefaultStoreValuesFactory
      ? opts.defaultStoreValues(req)
      : opts.defaultStoreValues;

    asyncLocalStorage.run({ ...defaultStoreValues }, () => {
      const asyncResource =
        opts.createAsyncResource != null
          ? opts.createAsyncResource(req, requestContext)
          : new AsyncResource('fastify-request-context');
      req[asyncResourceSymbol] = asyncResource;
      asyncResource.runInAsyncScope(done, req.raw);
    });
  });

  if (hook === 'onRequest' || hook === 'preParsing') {
    fastify.addHook('preValidation', (req, _res, done) => {
      const asyncResource = req[asyncResourceSymbol];
      asyncResource.runInAsyncScope(done, req.raw);
    });
  }

  next();
}
