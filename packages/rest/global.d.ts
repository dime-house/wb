import { RequestContext } from '@dime/rest';

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
