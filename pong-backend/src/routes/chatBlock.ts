import { FastifyInstance } from "fastify";
import { ChatBlockController } from "../controllers/chatBlockControllers.js";
import { ChatBlockDeleteDTO, ChatBlockPostDTO } from "../types/RouteChatBlock.js";

function chatBlockRoute(fastify: FastifyInstance) {
	const chatBlockControllerInstance = new ChatBlockController();

	fastify.post<{ Body: ChatBlockPostDTO }>('/add-block', {
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

	fastify.delete<{ Querystring: ChatBlockDeleteDTO }>('/remove-block', {
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
