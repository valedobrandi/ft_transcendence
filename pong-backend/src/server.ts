import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import loginRoute from './routes/login.js';
import { friendsRoute } from './routes/friend.js';
import websocketRoute from './routes/websocket.js';
import jwt from '@fastify/jwt';
import profilRoute from './routes/profil.js';
import chatBlockRoute from './routes/chatBlock.js';
import { eventsRoutes } from './routes/events.js';
import cookie from '@fastify/cookie';
import { matchesRoute } from './routes/match.js';
import fastifyStatic from "@fastify/static";
import path from "path";

import avatarRoute from './routes/avatar.js';
import twoFARoutes from './routes/2faRoutes.js'
import { tournamentsRoute } from './routes/tournament.js';
import { logout } from './routes/logout.js';

const fastify = Fastify({
	logger: {
		level: 'error',
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname,time',
			},
		},
	}
});

declare module 'fastify' {
	interface FastifyRequest {
		userId: number;
	}
	interface FastifyInstance {
		authenticate: any;
	}
}



fastify.decorateRequest("userId", 0);


fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
	try
	{
		const decoded = await request.jwtVerify() as { id: number };
        //print(`Authenticated user with ID: ${JSON.stringify(decoded)}`);
		request.userId = decoded.id;
        if (request.userId === 0) {
            reply.code(401).send({ error: 'Unauthorized' });
        }

	}
	catch (AcessTokenErr)
	{
		const refreshToken = request.cookies?.refreshCookie;

		if (!refreshToken) {
			return reply.status(401).send({ message: 'Non autorisé, pas de refresh token' });
		}
		try
		{
			const refreshPayload = fastify.jwt.verify(refreshToken);
			const newAccessToken = fastify.jwt.sign({ user: request.user}, { expiresIn: '4h' });
            if(!newAccessToken)
                return reply.status(404).send({error: "AccessToken not found"});

            reply.setCookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: '/'
            });

			const decoded = fastify.jwt.verify(newAccessToken);
        	request.user = decoded;
		}
		catch (refreshTokenErr)
		{
			reply.status(401).send({err: "refresh Token in cookie expire"});
		}
	}
});


fastify.register(cookie, {
  secret: process.env.COOKIE_SECRET,   // optionnel, pour cookies signés
  hook: 'onRequest',                   // parse les cookies tôt
});

fastify.register(jwt, {
	secret: process.env.JWT_SECRET || 'default_secret_key',
});


fastify.register(loginRoute);
fastify.register(authRoutes);
fastify.register(profilRoute);
fastify.register(eventsRoutes);
fastify.register(matchesRoute);
fastify.register(friendsRoute);
fastify.register(chatBlockRoute);
fastify.register(avatarRoute);
fastify.register(twoFARoutes);
fastify.register(tournamentsRoute);
fastify.register(logout);
await fastify.register(websocketRoute);

await fastify.register(fastifyCors, {
	origin: true,
	methods: ['POST', 'OPTIONS', 'GET', 'DELETE', 'PUT'],
	allowedHeaders: ['Authorization', 'Content-Type'],
  	credentials: true
});

export function print(message: string) {
	//console.log(`[Log]: ${message}`);
}

export { fastify };

