import Database from 'better-sqlite3'
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fastify, print } from '../server.js';
import { statusCode } from "../types/statusCode";
import db from "../../database/db";
import { EventsService } from "./events";
import { connectedRoomInstance } from "../state/ConnectedRoom";

export interface FriendListDTO {
	id: string;
}

export type FriendsTableModel = {
	friend_id: number;
}

export type GetFriendsList = {
	status: 'success' | 'error';
	data: number[] | [];
}

export type AddFriend = {
	status: 'success' | 'error';
	data: {};
}

export type RemoveFriend = {
	status: 'success' | 'error';
	data: {};
}

function friendsRoute(fastify: FastifyInstance) {

	fastify.post('/add-friend', {
		preHandler: fastify.authenticate,
		schema: {
			body: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}
		},
		handler: friendsControllerInstance.addFriend.bind(friendsControllerInstance)
	});

	fastify.delete('/remove-friend', {
		preHandler: fastify.authenticate,
		schema: {
			body: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}
		},
		handler: friendsControllerInstance.removeFriend.bind(friendsControllerInstance)
	});

	fastify.get('/friends-list', {
		preHandler: fastify.authenticate,
		handler: friendsControllerInstance.getFriendsList.bind(friendsControllerInstance)
	});
}


class FriendsController {
	private friendsService = new FriendService()

	getFriendsList(req: FastifyRequest, res: FastifyReply) {
		const id = Number(req.userId);
		const { status, data } = this.friendsService.getFriendsList(id);
		return res.status(statusCode('OK')).send({ message: status, payload: data });
	}

	addFriend(req: FastifyRequest<{ Body: FriendListDTO }>, res: FastifyReply) {
		const id = Number(req.userId);
		const friendId = Number(req.body.id);

		const { status, data } = this.friendsService.addFriend(id, friendId);

		return res.status(statusCode('OK')).send({ message: status, data });
	}

	removeFriend(req: FastifyRequest<{ Body: FriendListDTO }>, res: FastifyReply) {
		const id = Number(req.userId);
		const friendId = Number(req.body.id);

		const { status, data } = this.friendsService.removeFriend(id, friendId);

		return res.status(statusCode('OK')).send({ message: status, data });
	}
}

class FriendService {
	private friendModelInstance = new FriendsModel(db);

	getFriendsList(userId: number) {
		const { status, data } = this.friendModelInstance.getFriendsList(userId);
		connectedRoomInstance.friendListSet(userId).save(data.filter(id => id !== Number(userId)));
		const createFriendList = connectedRoomInstance.friendListSet(userId)
			.get().map((friendId: number | bigint) => ({
			id: friendId,
			isConnected: connectedRoomInstance.has(friendId) ? true : false
		}));
		return { status, data: createFriendList };
	}

	addFriend(requestId: number, friendId: number) {
		const response = this.friendModelInstance.checkFriendsStatus(requestId, friendId);
		if (response === false) {
			this.friendModelInstance.addFriend(requestId, friendId);
			try {
				connectedRoomInstance.friendListSet(requestId).add(friendId);
			} catch (error) {
				fastify.log.error(error);
			}
			try {
				connectedRoomInstance.friendListSet(friendId).add(requestId);
			} catch (error) {
				fastify.log.error(error);
			}
		}

		return { status: 'success', data: {} };
	}

	removeFriend(userId: number, friendId: number) {
		const { status, data } = this.friendModelInstance.removeFriend(userId, friendId);
		connectedRoomInstance.friendListSet(userId).delete(friendId);
		return { status, data };
	}
}


class FriendsModel {
	private db: Database.Database;
	private stmGetFriendsList: Database.Statement;
	private stmAddFriend: Database.Statement;
	private stmRemoveFriend: Database.Statement;
	private stmGetFriendStatus: Database.Statement;

	constructor(db: Database.Database) {
		this.db = db;
		this.stmGetFriendsList = db.prepare(
			`SELECT friend_id AS friendId FROM friends WHERE user_id = ?
				UNION
					SELECT user_id AS friendId FROM friends WHERE friend_id = ?`);
		this.stmAddFriend = db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)');
		this.stmRemoveFriend = db.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?');
		this.stmGetFriendStatus = db.prepare(
			`SELECT * FROM friends 
				WHERE user_id = ? AND friend_id = ? 
					OR user_id = ? AND friend_id = ?`);
	}

	getFriendsList(userId: number): GetFriendsList {
		const response = this.stmGetFriendsList.all(userId, userId);
		return { status: 'success', data: response.map(row => row.friendId) };
	}

	checkFriendsStatus(userId: number, friendId: number): boolean {
		const response = this.stmGetFriendStatus.get(userId, friendId, friendId, userId);
		return response !== undefined;
	}

	addFriend(userId: number, friendId: number): AddFriend {
		try {
			this.stmAddFriend.run(userId, friendId);
			return { status: 'success', data: {} };
		} catch (error) {
			print(`[ERROR] Unable to add friend: ${error}`);
			return { status: 'error', data: {} };
		}
	}

	removeFriend(userId: number, friendId: number): RemoveFriend {
		const response = this.stmRemoveFriend.run(userId, friendId);
		return { status: 'success', data: {} };
	}
}

export default FriendsModel;


const friendsControllerInstance = new FriendsController();

export { friendsRoute, FriendsController, friendsControllerInstance, FriendService, FriendsModel };