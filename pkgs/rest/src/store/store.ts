import type { PrimaryKey } from '@wb/type';
import { AsyncResource } from 'node:async_hooks';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { AsyncLocalStorage } from 'async_hooks';

export const als = new AsyncLocalStorage<Context>();

export class Context extends AsyncResource {
  requestId: PrimaryKey;
  request: FastifyRequest;
  replay: FastifyReply;
  done: HookHandlerDoneFunction;
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

  mutate(payload?: Partial<Context> | any): this {
    mutate(payload);

    return this;
  }

  enterWith(): this {
    als.enterWith(this);

    return this;
  }

  run(callback: () => void): this {
    als.run(this, callback);
    return this;
  }

  inAsyncScope() {
    super.runInAsyncScope(this.done);
  }
}

export function enterWith(payload?: Partial<Context> | any): void {
  new Context().mutate(payload).enterWith();
}

export function runInAsyncScope(payload?: Partial<Context> | any): void {
  new Context()
    .run(() => {
      mutate(payload);
    })
    .inAsyncScope();
}
export function mutate(payload?: Partial<Context> | any): void {
  if (payload) {
    Object.entries(payload).forEach(([key, value]) => {
      als.getStore()[key] = value;
    });
  }
}

export function useContext() {
  return { mutate, runInAsyncScope, enterWith };
}
