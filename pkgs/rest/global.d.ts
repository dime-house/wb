import { RequestContext } from './src/Types';

declare module 'fastify' {
  interface FastifyRequest {
    ctx: RequestContext;
  }

  interface FastifyInstance {
    ctx: RequestContext;
  }
}
