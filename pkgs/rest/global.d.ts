import { RequestContext } from './src/Types';
// export class module:net. Socket extends Duplex
declare module 'fastify' {
  interface FastifyRequest {
    ctx: RequestContext;
    startTime: [number, number];
  }

  interface FastifyInstance {
    ctx: RequestContext;
  }
}

declare module 'http' {
  interface IncomingMessage {
    ip: string;
  }
}

declare module 'net' {
  interface Socket {
    metrics: {
      in: number;
      out: number;
    };
  }
}
