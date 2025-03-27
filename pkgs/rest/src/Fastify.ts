import { IncomingMessage, Server, ServerResponse } from 'node:http';
import fastify, { FastifyInstance } from 'fastify';
import { createFastifyLogger } from '@wb/log';
import cors from '@fastify/cors';
import { AsyncLocalStorage, AsyncResource } from 'node:async_hooks';
import { FastifyRequestContextOptions, RequestContext } from './Types';

const hook: FastifyRequestContextOptions['hook'] = 'onRequest',
  defaultStoreValues: FastifyRequestContextOptions['defaultStoreValues'] = {
    user: { id: 'system' },
  },
  createAsyncResource: FastifyRequestContextOptions['createAsyncResource'] =
    undefined;

const hasDefaultStoreValuesFactory = typeof defaultStoreValues === 'function';

const asyncResourceSymbol = Symbol('asyncResource');
const asyncLocalStorage = new AsyncLocalStorage();

const ctx: RequestContext = {
  get: (key: any) => {
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
export const Fastify: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  fastify({
    loggerInstance: createFastifyLogger().logger,
  });

Fastify.register(cors)
  .decorate('ctx', ctx)
  .decorateRequest('ctx', { getter: () => ctx })
  .decorateRequest(asyncResourceSymbol, null);

Fastify.addHook(hook, (req, _res, done) => {
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
