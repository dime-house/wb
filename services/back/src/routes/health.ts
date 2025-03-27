import { FastifyRequest } from 'fastify';
import { post } from '@wb/rest';

type CustomRequest = FastifyRequest<{
  Body: { name: boolean };
}>;

post('/domains', async (request: CustomRequest, reply) => {
  try {
    const { name } = request.body;

    reply.code(200).send({
      message: `Hello ${name}!`,
    });
  } catch (e) {
    reply.code(500).send({
      message: 'Something went wrong',
    });
  }
});
