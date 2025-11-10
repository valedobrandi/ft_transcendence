import { FastifyInstance } from "fastify";
import { chatBlockDeleteSchema, chatBlockGetSchema, chatBlockPostSchema } from "../types/RouteChatBlock.js";
import { ChatBlockController } from "../controllers/chatBlockControllers.js";

function chatBlockRoute(fastify: FastifyInstance) {
    const chatBlockControllerInstance = new ChatBlockController();

    fastify.post('/block-user', {
        preHandler: [fastify.authenticate],
        schema: {
			querystring: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}
		},
        handler: chatBlockControllerInstance.blockUser.bind(chatBlockControllerInstance)
    });

    fastify.delete('/unblock-user', {
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

    fastify.get('/blocked-users', {
        preHandler: [fastify.authenticate],
        handler: chatBlockControllerInstance.getBlockedUsers.bind(chatBlockControllerInstance)
    });
}

export default chatBlockRoute;
