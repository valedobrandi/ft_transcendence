import { FriendService } from "../services/friendService";
import { FastifyReply, FastifyRequest } from "fastify";

export interface FriendListDTO {
	id: string;
}

export interface JWTID {
	userId: number;
}

class FriendsController {
	private friendsService = new FriendService()

	getFriendsList(req: FastifyRequest<{Querystring: FriendListDTO}>, res: FastifyReply) {
		const id = Number(req.query.id);
		const response = this.friendsService.getFriendsList(id);
		return res.status(200).send({ message: "success", friendsList: response });
	}

	addFriend(req: FastifyRequest<{Querystring: FriendListDTO, Body: {id: number}}>, res: FastifyReply) {
		const id = Number(req.query.id);
		this.friendsService.addFriend(userId, id);
	}

	removeFriend(req: FastifyRequest<{Querystring: FriendListDTO}>, res: FastifyReply) {
		const id = Number(req.query.id);
		this.friendsService.removeFriend(userId, friendId);
	}
}

export { FriendsController };