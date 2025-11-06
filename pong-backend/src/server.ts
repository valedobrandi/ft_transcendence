import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import friendRoute from './routes/friend.js';
import loginRoute from './routes/login.js';
import websocketRoute from './routes/websocket.js';
import { registerChatBlockRoutes } from './routes/chatBlock.js';
import Jwt from '@fastify/jwt';
import profilRoutes from './routes/profil.js';



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
      //await request.jwtVerify();
	  const verif = await request.jwtVerify();
	  console.log(verif);
    } 
    catch (err) 
    {
      reply.send(err);
    }
  });

fastify.register(Jwt, {
  secret: process.env.JWT_SECRET ?? 'supersecret'
});

fastify.decorateRequest("userId", null);

fastify.register(loginRoute);


fastify.register(authRoutes);
fastify.register(profilRoutes);
fastify.register(matchRoute);
fastify.register(friendRoute);
fastify.register(registerChatBlockRoutes);
await fastify.register(websocketRoute);


await fastify.register(fastifyCors, {
	origin: true,
	methods: ['POST', 'OPTIONS'],
});

export function print(message: string) {
	console.log(`[Log]: ${message}`);
}

export { fastify };

