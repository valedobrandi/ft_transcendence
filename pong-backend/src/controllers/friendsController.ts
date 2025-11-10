import { print } from "../server";
import { FriendService } from "../services/friendService";
import { FastifyReply, FastifyRequest } from "fastify";

export interface FriendListDTO {
	id: string;
}

class FriendsController {
	private friendsService = new FriendService()

	getFriendsList(req: FastifyRequest, res: FastifyReply) {
		const id = Number(req.userId);
		const {status, data} = this.friendsService.getFriendsList(id);
		if (status === 'error') {
			return res.status(500).send({message : status} );
		}
		return res.status(200).send({status, payload:data});
	}

	addFriend(req: FastifyRequest<{Querystring: FriendListDTO, Body: {id: number}}>, res: FastifyReply) {
		const id = Number(req.userId);
		const friendId = Number(req.query.id);
		const {status, data} = this.friendsService.addFriend(id, friendId);
		if (status === 'error') {
			return res.status(500).send({message : status} );
		}
		return res.status(200).send({message: status, data});
	}

	removeFriend(req: FastifyRequest<{Querystring: FriendListDTO}>, res: FastifyReply) {
		const id = Number(req.userId);
		const friendId = Number(req.query.id);
		const {status, data} = this.friendsService.removeFriend(id, friendId);
		if (status === 'error') {
			return res.status(500).send({message : status} );
		}
		return res.status(200).send({message: status, data});
	}
}

export const friendsControllerInstance = new FriendsController();