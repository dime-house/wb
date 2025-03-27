import f from 'fastify';
import cors from '@fastify/cors';

export const Fastify = f({
	logger: true,
}).register(cors);

export const post = Fastify.post;
