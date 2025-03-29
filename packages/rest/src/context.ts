import { FastifyReply, FastifyRequest } from 'fastify';
import { HookHandlerDoneFunction as DoneFn } from 'fastify/types/hooks';
import { AsyncResource } from 'node:async_hooks';
import { AsyncLocalStorage } from 'async_hooks';
import { PrimaryKey } from '@dime/type';

export const als = new AsyncLocalStorage<Context>();

export class Context {
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

  inAsyncScope() {
    this._.runInAsyncScope(this.done);
  }

  run(callback: () => void): this {
    als.run(this, callback);
    return this;
  }

  private _ = new AsyncResource('request-context');
}

export function enterWith(payload?: {
  request: FastifyRequest;
  replay: FastifyReply;
  done: DoneFn;
}): void {
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
