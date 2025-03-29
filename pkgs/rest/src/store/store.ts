import type { PrimaryKey } from '@wb/type';
import { AsyncResource } from 'node:async_hooks';
import {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction as DoneFn,
} from 'fastify';
import { AsyncLocalStorage } from 'async_hooks';

export const als = new AsyncLocalStorage<Context>();
class BaseContext extends AsyncResource {}
export class Context extends BaseContext {
  requestId: PrimaryKey;
  request: FastifyRequest;
  replay: FastifyReply;
  done: DoneFn;
  ip: string;

  get params() {
    return this.request.params;
  }

  get body() {
    return this.request.body;
  }

  constructor() {
    super('request-context');
  }

  inAsyncScope() {
    super.runInAsyncScope(this.done);
  }

  run(callback: () => void): this {
    als.run(this, callback);
    return this;
  }
}

export function enterWith(payload?: Partial<Context>): void {
  new Context()
    .run(() => {
      mutate(payload);
    })
    .inAsyncScope();
}

export function mutate(payload?: Partial<Context>): void {
  if (payload) {
    Object.entries(payload).forEach(([key, value]) => {
      als.getStore()[key] = value;
    });
  }
}

export function useContext() {
  return { mutate, enterWith };
}
