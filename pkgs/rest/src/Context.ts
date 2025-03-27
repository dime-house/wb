import { FastifyRequestContextOptions, RequestContext } from './Types';
import { AsyncLocalStorage } from 'node:async_hooks';

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

export {
  ctx,
  hook,
  defaultStoreValues,
  createAsyncResource,
  hasDefaultStoreValuesFactory,
  asyncResourceSymbol,
};
