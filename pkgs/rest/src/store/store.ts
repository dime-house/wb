import type { NextFunction, Request, Response } from 'express';
import { StoreBase } from './store.base.js';
import type { PrimaryKey } from '@wb/type';

export class Store<TBody = Request['body']> extends StoreBase {
  [key: string]: any;

  request_id: PrimaryKey;
  request: Request;
  response: Response;
  next: NextFunction;

  get req(): Request {
    return this.request;
  }

  get res(): Response {
    return this.response;
  }

  get params(): Request['params'] {
    return this.req.params;
  }

  get body(): TBody {
    return this.req.body;
  }
}
