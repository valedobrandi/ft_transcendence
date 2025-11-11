import { FriendService } from "../services/friendService";
import { FastifyReply, FastifyRequest } from "fastify";
import { statusCode } from "../types/statusCode";

export interface FriendListDTO {
	id: string;
}

class FriendsController {
	private friendsService = new FriendService()

	getFriendsList(req: FastifyRequest, res: FastifyReply) {
		const id = Number(req.userId);
		const {status, data} = this.friendsService.getFriendsList(id);
		return res.status(statusCode('OK')).send({message: status, payload: data});
	}

	addFriend(req: FastifyRequest<{Body: FriendListDTO}>, res: FastifyReply) {
		const id = Number(req.userId);
		const friendId = Number(req.body.id);
		const {status, data} = this.friendsService.addFriend(id, friendId);
		return res.status(statusCode('OK')).send({message: status, data});
	}

	removeFriend(req: FastifyRequest<{Body: FriendListDTO}>, res: FastifyReply) {
		const id = Number(req.userId);
		const friendId = Number(req.body.id);
		const {status, data} = this.friendsService.removeFriend(id, friendId);
		return res.status(statusCode('OK')).send({message: status, data});
	}
}

export const friendsControllerInstance = new FriendsController();