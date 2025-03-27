import { AsyncLocalStorage } from 'async_hooks';
import { Store } from './store.js';

export class StoreBase {
  static ca: Buffer;
  static cert: Buffer;
  static key: Buffer;

  static als = new AsyncLocalStorage<Store>();

  static get store(): Store {
    return Store.als.getStore() as Store;
  }

  static enterWith(payload?: Partial<Store>): void {
    Store.als.enterWith(new Store());
    if (payload) Store.mutate(payload);
  }

  static mutate(payload?: Partial<Store>) {
    if (payload) {
      Object.entries(payload).forEach(([key, value]) => {
        Store.store[key] = value;
      });
    }
  }
}
