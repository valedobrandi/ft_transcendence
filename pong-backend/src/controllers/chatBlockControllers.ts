import { FastifyReply, FastifyRequest } from "fastify";
import { ChatBlockService } from "../services/chatBlockService.js";
import { ChatBlockDeleteDTO, ChatBlockGetDTO, ChatBlockPostDTO } from "../types/RouteChatBlock.js";
import { codes } from "../types/FastifyResponse.js";

class ChatBlockController {
    private chatBlockServiceInstance = new ChatBlockService();

    blockUser(req: FastifyRequest<{Body: ChatBlockPostDTO}>, res: FastifyReply) {
        const { userId, blockedUserId } = req.body;
        const { status } = this.chatBlockServiceInstance.addUserToBlockList(Number(userId), Number(blockedUserId));
        if (status === "success") {
            return res.status(200).send({ message: codes[200] });
        }
        return res.status(400).send({ message: codes[400] });
    }

    unblockUser(req: FastifyRequest<{Body: ChatBlockDeleteDTO}>, res: FastifyReply) {
        const { userId, blockedUserId } = req.body;
        const { status } = this.chatBlockServiceInstance.deleteUserFromBlockList(Number(userId), Number(blockedUserId));
        if (status === "success") {
            return res.status(200).send({ message: codes[200] });
        }
        return res.status(400).send({ message: codes[400] });
    }

    getBlockedUsers(req: FastifyRequest<{Querystring: ChatBlockGetDTO}>, res: FastifyReply) {
        const { userId } = req.query;
        const { status, data } = this.chatBlockServiceInstance.getBlockedUsers(Number(userId));
        if (status === "success") {
            return res.status(200).send({ payload: data });
        }
        return res.status(400).send({ message: codes[400] });
    }
}

export { ChatBlockController };