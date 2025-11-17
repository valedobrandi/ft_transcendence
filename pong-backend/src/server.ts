import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import friendRoute from './routes/friend.js';
import loginRoute from './routes/login.js';
import AvatarRoute from './routes/avatar.js';
import websocketRoute from './routes/websocket.js';
import { registerChatBlockRoutes } from './routes/chatBlock.js';
import Jwt from '@fastify/jwt';
import profilRoutes from './routes/profil.js';
import cookie from '@fastify/cookie';
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs";

const fastify = Fastify({
	logger: {
		level: 'info',
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname',
			},
		},
	}
});

fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
	try 
	{
		await request.jwtVerify();
		
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

fastify.register(Jwt, {
	secret: process.env.JWT_SECRET ?? 'supersecret'
});

fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), "src/images"),
    prefix: "/images/",
});

fastify.decorateRequest("userId", null);

fastify.register(loginRoute);
fastify.register(authRoutes);
fastify.register(profilRoutes);
fastify.register(matchRoute);
fastify.register(friendRoute);
fastify.register(AvatarRoute);
fastify.register(registerChatBlockRoutes);
await fastify.register(websocketRoute);


await fastify.register(fastifyCors, {
	origin: true,
	methods: ['POST', 'OPTIONS', 'PUT'],
});

export function print(message: string) {
	console.log(`[Log]: ${message}`);
}

export { fastify };

