import { FastifyInstance } from "fastify";
import { friendsControllerInstance } from "../controllers/friendsController";

export default function friend(fastify: FastifyInstance) {

	fastify.post('/add-friend', {
		preHandler: fastify.authenticate,
		schema: {
			querystring: {
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
			querystring: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}
		},
		handler: friendsControllerInstance.removeFriend.bind(friendsControllerInstance)
	});

	fastify.get('/friends-list', {
		preHandler: fastify.authenticate,
		schema: {
			querystring: {
				type: 'object',
				properties: { id: { type: 'string' } },
				required: ['id']
			}
		},
		handler: friendsControllerInstance.getFriendsList.bind(friendsControllerInstance)
	});
}