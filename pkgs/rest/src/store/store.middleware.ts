import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { Store } from './store.js';

const context: RequestHandler = asyncHandler(async (req, res, next) => {
  const ac = new AbortController();

  req.abortSignal = ac.signal;

  res.on('close', ac.abort.bind(ac));

  const request_id = req.headers['x-request-id']?.[0] || randomUUID();

  Store.enterWith({
    request_id,
    get request() {
      return req;
    },
    get response() {
      return res;
    },
  });

  const server_id = req.header('x-server-id') ?? req.body?.['server_id'];

  if (server_id) {
    Store.mutate({
      cloudManager: cloud(getDockerOptions(await findServerById(server_id))),
    });
  }

  res.payload = <T>(data: T) => {
    res.locals['payload'] = { data };
  };

  res.ok = <T>(data: T, message: string | undefined) => {
    res.locals['payload'] = { data, message };
  };

  res.notify = (message: string) => {
    res.locals['payload'] = { message };
  };

  res.bad = (error: CloudError, message: string) => {
    throw cloudError(error, message);
  };

  res.invalid = (message: string) => {
    throw cloudError(CloudError.INVALID, message);
  };

  return next();
});

export default context;
