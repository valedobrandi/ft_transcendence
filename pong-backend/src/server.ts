import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import friendRoute from './routes/friend.js';
import loginRoute from './routes/login.js';
import websocketRoute from './routes/websocket.js';
import * as jwt from '@fastify/jwt';
import profilRoute from './routes/profil.js';
import chatBlockRoute from './routes/chatBlock.js';
import cookie from '@fastify/cookie';

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

declare module 'fastify' {
  interface FastifyRequest {
    userId: number | null;
  }
}

fastify.decorateRequest("userId", null);


fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
	try
	{
		const decoded = await request.jwtVerify();
        print(`Authenticated user with ID: ${JSON.stringify(decoded)}`);
		request.userId = decoded.id;
        if (!request.userId) {
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
    secret: process.env.JWT_SECRET || 'supersecret'
});


fastify.register(loginRoute);
fastify.register(authRoutes);
fastify.register(profilRoute);
fastify.register(matchRoute);
fastify.register(friendRoute);
fastify.register(chatBlockRoute);
await fastify.register(websocketRoute);

await fastify.register(fastifyCors, {
    origin: true,
    methods: ['POST', 'OPTIONS', 'PUT'],
});

export function print(message: string) {
    console.log(`[Log]: ${message}`);
}

export { fastify };

