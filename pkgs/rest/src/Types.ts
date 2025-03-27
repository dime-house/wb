import { FastifyRequest } from 'fastify';
import { AsyncResource } from 'node:async_hooks';

type CustomRequest = FastifyRequest<{
  Body: { name: boolean };
}>;

export interface RequestContextData {
  // Empty on purpose, to be extended by users of this module
}

export interface RequestContext {
  get<K extends keyof RequestContextData>(
    key: K
  ): RequestContextData[K] | undefined;
  set<K extends keyof RequestContextData>(
    key: K,
    value: RequestContextData[K]
  ): void;
  getStore(): RequestContextData | undefined;
}

export type CreateAsyncResourceFactory<
  T extends AsyncResource = AsyncResource
> = (req: FastifyRequest, context: RequestContext) => T;

export type RequestContextDataFactory = (
  req: FastifyRequest
) => RequestContextData;

export type Hook =
  | 'onRequest'
  | 'preParsing'
  | 'preValidation'
  | 'preHandler'
  | 'preSerialization'
  | 'onSend'
  | 'onResponse'
  | 'onTimeout'
  | 'onError'
  | 'onRoute'
  | 'onRegister'
  | 'onReady'
  | 'onClose';

export interface FastifyRequestContextOptions {
  defaultStoreValues?: RequestContextData | RequestContextDataFactory;
  hook?: Hook;
  createAsyncResource?: CreateAsyncResourceFactory;
}

export const ctx: RequestContext;
