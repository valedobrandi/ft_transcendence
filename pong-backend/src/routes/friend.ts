import { FastifyInstance } from "fastify";

export default function friend(fastify: FastifyInstance) {
	fastify.post('/friendlist/:id', {
		schema: {
			querystring: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}
		},
		handler: () => { }
	});

	fastify.delete('/friendlist/:id', {
		schema: {},
		handler: () => { }
	});
}