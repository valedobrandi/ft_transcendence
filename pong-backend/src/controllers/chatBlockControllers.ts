import { FastifyReply, FastifyRequest } from "fastify";
import { ChatBlockService } from "../services/chatBlockService.js";
import { ChatBlockDeleteDTO, ChatBlockGetDTO, ChatBlockPostDTO } from "../types/RouteChatBlock.js";
import { statusCodeMessage } from "../types/FastifyResponse.js";

class ChatBlockController {
    private chatBlockServiceInstance = new ChatBlockService();

    blockUser(req: FastifyRequest<{Querystring: ChatBlockPostDTO}>, res: FastifyReply) {
        const id = Number(req.userId);
		const friendId = Number(req.query.id);
        const { status } = this.chatBlockServiceInstance.addUserToBlockList(id, friendId);
        if (status === "success") {
            return res.status(200).send({ message: statusCodeMessage[200] });
        }
        return res.status(400).send({ message: statusCodeMessage[400] });
    }

    unblockUser(req: FastifyRequest<{Querystring: ChatBlockDeleteDTO}>, res: FastifyReply) {
        const id = Number(req.userId);
		const friendId = Number(req.query.id);
        const { status } = this.chatBlockServiceInstance.deleteUserFromBlockList(id, friendId);
        if (status === "success") {
            return res.status(200).send({ message: statusCodeMessage[200] });
        }
        return res.status(400).send({ message: statusCodeMessage[400] });
    }

    getBlockedUsers(req: FastifyRequest, res: FastifyReply) {
        const id = Number(req.userId);
        const { status, data } = this.chatBlockServiceInstance.getBlockedUsers(id);
        if (status === "success") {
            return res.status(200).send({ payload: data });
        }
        return res.status(400).send({ message: statusCodeMessage[400] });
    }
}

export { ChatBlockController };

