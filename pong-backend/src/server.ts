import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import friendRoute from './routes/friend.js';
import websocketRoute from './routes/websocket.js';
import { registerChatBlockRoutes } from './routes/chatBlock.js';


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

    fastify.register(authRoutes);
    fastify.register(matchRoute);
    fastify.register(friendRoute);
    await fastify.register(registerChatBlockRoutes);
    await fastify.register(websocketRoute);


fastify.setErrorHandler((error, request, reply) => {
    console.error('Global error:', error);
    reply.status(500).send({ error: error.message });
});



await fastify.register(fastifyCors, {
    origin: true,
    methods: ['POST', 'OPTIONS'],
});

export function print(message: string) {
    console.log(`[Log]: ${message}`);
}

export { fastify };

