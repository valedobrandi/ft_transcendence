import { FastifyInstance, FastifyReply, FastifyRequest  } from "fastify";
import { statusCode } from "../types/statusCode";
import Database from 'better-sqlite3'
import db from "../../database/db";
import { EventsModel } from "./events";
import { connectedRoomInstance } from "../state/ConnectedRoom";

export interface FriendListDTO {
	id: string;
	event_id?: string;
}


function friendsRoute(fastify: FastifyInstance) {

	fastify.post('/add-friend', {
		preHandler: fastify.authenticate,
		schema: {
			body: {
				type: 'object',
				properties: { id: { type: 'string' }, event_id: { type: 'string' } },
				required: ['id', 'event_id']
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
		const {status, data} = this.friendsService.getFriendsList(id);
		return res.status(statusCode('OK')).send({message: status, payload: data});
	}

	addFriend(req: FastifyRequest<{Body: FriendListDTO}>, res: FastifyReply) {
		const id = Number(req.userId);
		const friendId = Number(req.body.id);

		const eventId = req.body.event_id ? Number(req.body.event_id) : undefined;

		const {status, data} = this.friendsService.addFriend(id, friendId, eventId);

		return res.status(statusCode('OK')).send({message: status, data});
	}

	removeFriend(req: FastifyRequest<{Body: FriendListDTO}>, res: FastifyReply) {
		const id = Number(req.userId);
		const friendId = Number(req.body.id);
		const {status, data} = this.friendsService.removeFriend(id, friendId);
		return res.status(statusCode('OK')).send({message: status, data});
	}
}

class FriendService {
	private friendModelInstance = new FriendsModel(db);
	private eventsModelInstance = new EventsModel(db);

	getFriendsList(userId: number) {
		const { status, data } = this.friendModelInstance.getFriendsList(userId);
		connectedRoomInstance.friendListSet(userId).save(data);
		return { status, data };
	}

	addFriend(userId: number, friendId: number, eventId?: number) {
		this.friendModelInstance.addFriend(userId, friendId);
		this.friendModelInstance.addFriend(friendId, userId);
		if (eventId) {
			this.eventsModelInstance.deleteEvent(eventId);
		}
		connectedRoomInstance.friendListSet(userId).add(friendId);
		connectedRoomInstance.friendListSet(friendId).add(userId);
		return { status: 'success', data: {} };
	}

	removeFriend(userId: number, friendId: number) {
		const { status, data } = this.friendModelInstance.removeFriend(userId, friendId);
		connectedRoomInstance.friendListSet(userId).delete(friendId);
		return { status, data };
	}
}

import { print } from '../server';

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

class FriendsModel {
	private db: Database.Database;
	private stmGetFriendsList: Database.Statement;
	private stmAddFriend: Database.Statement;
	private stmRemoveFriend: Database.Statement;

	constructor(db: Database.Database) {
		this.db = db;
		this.stmGetFriendsList = db.prepare('SELECT friend_id FROM friends WHERE user_id = ?');
		this.stmAddFriend = db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)');
		this.stmRemoveFriend = db.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?');
	}

	getFriendsList(userId: number): GetFriendsList {
		const response =  this.stmGetFriendsList.all(userId) as FriendsTableModel[];
		return { status: 'success',data: response.map(row => row.friend_id) };
	}

	addFriend(userId: number, friendId: number): AddFriend  {
		try {
			const response = this.stmAddFriend.run(userId, friendId);
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