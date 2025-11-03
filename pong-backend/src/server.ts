import Fastify from 'fastify';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import friendRoute from './routes/friend.js';
import 'dotenv/config';

import websocketRoute from './routes/websocket.js';
import fastifyCors from '@fastify/cors';

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
await fastify.register(websocketRoute);

await fastify.register(fastifyCors, {
  origin: true, // or specify allowed origins
  methods: ['POST', 'OPTIONS'],
});

export function print(message: string) {
    console.log(`[Log]: ${message}`);
}

export { fastify };

