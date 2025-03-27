import { post } from './app.js';
import { FastifyRequest } from 'fastify';

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
