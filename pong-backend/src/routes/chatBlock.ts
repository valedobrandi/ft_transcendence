import { FastifyInstance } from "fastify";
import { ChatBlockController } from "../controllers/chatBlockControllers.js";

function chatBlockRoute(fastify: FastifyInstance) {
    const chatBlockControllerInstance = new ChatBlockController();

    fastify.post('/add-block', {
        preHandler: [fastify.authenticate],
        schema: {
			body: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}
		},
        handler: chatBlockControllerInstance.blockUser.bind(chatBlockControllerInstance)
    });

    fastify.delete('/remove-block', {
        preHandler: [fastify.authenticate],
        schema: {
			querystring: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}
		},
        handler: chatBlockControllerInstance.unblockUser.bind(chatBlockControllerInstance)
    });

    fastify.get('/block-list', {
        preHandler: [fastify.authenticate],
        handler: chatBlockControllerInstance.getBlockedUsers.bind(chatBlockControllerInstance)
    });
}

export default chatBlockRoute;
