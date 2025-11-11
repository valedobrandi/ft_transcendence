import { FastifyReply, FastifyRequest } from "fastify";
import { ChatBlockService } from "../services/chatBlockService.js";
import { ChatBlockDeleteDTO, ChatBlockPostDTO } from "../types/RouteChatBlock.js";
import { statusCode } from "../types/statusCode.js";


class ChatBlockController {
    private chatBlockServiceInstance = new ChatBlockService();

    blockUser(req: FastifyRequest<{Querystring: ChatBlockPostDTO}>, res: FastifyReply) {
        const id = Number(req.userId);
		const friendId = Number(req.query.id);
        const { status } = this.chatBlockServiceInstance.addUserToBlockList(id, friendId);
        if (status === "success") {
            return res.status(statusCode('OK')).send({ message: status });
        }
        return res.status(statusCode('NO_CONTENT')).send({ message: status });
    }

    unblockUser(req: FastifyRequest<{Querystring: ChatBlockDeleteDTO}>, res: FastifyReply) {
        const id = Number(req.userId);
		const friendId = Number(req.query.id);
        const { status } = this.chatBlockServiceInstance.deleteUserFromBlockList(id, friendId);
        if (status === "success") {
            return res.status(statusCode('OK')).send({ message: status });
        }
        return res.status(statusCode('NO_CONTENT')).send({ message: status });
    }

    getBlockedUsers(req: FastifyRequest, res: FastifyReply) {
        const id = Number(req.userId);
        const { status, data } = this.chatBlockServiceInstance.getBlockedUsers(id);
        if (status === "success") {
            return res.status(statusCode('OK')).send({ message: status, payload: data });
        }
        return res.status(statusCode('NO_CONTENT')).send({ message: status });
    }
}

export { ChatBlockController };