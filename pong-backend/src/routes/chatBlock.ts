import { FastifyInstance } from "fastify";
import { chatBlockDeleteSchema, chatBlockGetSchema, chatBlockPostSchema } from "../types/RouteChatBlock.js";
import { ChatBlockController } from "../controllers/chatBlockControllers.js";

function chatBlockRoutes(fastify: FastifyInstance) {
    const chatBlockControllerInstance = new ChatBlockController();

    fastify.post('/block-user', {
        schema: {body: chatBlockPostSchema},
        handler: chatBlockControllerInstance.blockUser.bind(chatBlockControllerInstance)
    });

    fastify.delete('/unblock-user', {
        schema: {body: chatBlockDeleteSchema},
        handler: chatBlockControllerInstance.unblockUser.bind(chatBlockControllerInstance)
    });

    fastify.get('/blocked-users', {
        schema: {querystring: chatBlockGetSchema},
        handler: chatBlockControllerInstance.getBlockedUsers.bind(chatBlockControllerInstance)
    });
}

export default chatBlockRoutes;
