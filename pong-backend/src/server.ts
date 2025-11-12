import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import loginRoute from './routes/login.js';
import { friendsRoute } from './routes/friend.js';
import websocketRoute from './routes/websocket.js';
import * as jwt from '@fastify/jwt';
import profilRoute from './routes/profil.js';
import chatBlockRoute from './routes/chatBlock.js';
import { eventsRoutes } from './routes/events.js';



const fastify = Fastify({
	// logger: {
	// 	level: 'info',
	// 	transport: {
	// 		target: 'pino-pretty',
	// 		options: {
	// 			colorize: true,
	// 			translateTime: 'SYS:standard',
	// 			ignore: 'pid,hostname',
	// 		},
	// 	},
	// }
});

declare module 'fastify' {
	interface FastifyRequest {
		userId: number | null;
	}
}

fastify.decorateRequest("userId", null);

fastify.decorate('authenticate', async function (request: FastifyRequest, res: FastifyReply) {
	try {
		const decoded = await request.jwtVerify();
		print(`Authenticated user with ID: ${JSON.stringify(decoded)}`);
		request.userId = decoded.id;
		if (!request.userId) {
			res.code(401).send({ error: 'Unauthorized' });
		}
	}
	catch (err) {
		res.code(401).send({ error: 'Unauthorized' });
	}
});

fastify.register(jwt, {
	secret: process.env.JWT_SECRET || 'supersecret'
});


fastify.register(loginRoute);
fastify.register(authRoutes);
fastify.register(profilRoute);
fastify.register(eventsRoutes);
fastify.register(matchRoute);
fastify.register(friendsRoute);
fastify.register(chatBlockRoute);
await fastify.register(websocketRoute);

await fastify.register(fastifyCors, {
	origin: true,
	methods: ['POST', 'OPTIONS'],
});

export function print(message: string) {
	console.log(`[Log]: ${message}`);
}

export { fastify };

