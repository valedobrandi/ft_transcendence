import { FastifyReply, FastifyRequest } from "fastify";
import { ChatBlockService } from "../services/chatBlockService.js";
import { ChatBlockDeleteDTO, ChatBlockGetDTO, ChatBlockPostDTO } from "../types/RouteChatBlock.js";

class ChatBlockController {
    private chatBlockServiceInstance = new ChatBlockService();

    blockUser(req: FastifyRequest<{Body: ChatBlockPostDTO}>, res: FastifyReply) {
        const { userId, blockedUserId } = req.body;
        this.chatBlockServiceInstance.addUserToBlockList(Number(userId), Number(blockedUserId));
        return res.status(200).send({ message: 'user blocked successfully' });
    }

    unblockUser(req: FastifyRequest<{Body: ChatBlockDeleteDTO}>, res: FastifyReply) {
        const { userId, blockedUserId } = req.body;
        this.chatBlockServiceInstance.deleteUserFromBlockList(Number(userId), Number(blockedUserId));
        return res.status(200).send({ message: 'user unblocked successfully' });
    }

    async getBlockedUsers(req: FastifyRequest<{Querystring: ChatBlockGetDTO}>, res: FastifyReply) {
        const { userId } = req.query;
        const blockedUsers = await this.chatBlockServiceInstance.getBlockedUsers(Number(userId));
        return res.status(200).send({ blockedUsers });
    }
}

export { ChatBlockController };

