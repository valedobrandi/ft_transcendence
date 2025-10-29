import Fastify from 'fastify';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import websocketRoute from './routes/websocket.js';

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
await fastify.register(websocketRoute);

export function print(message: string) {
    console.log(`[Log]: ${message}`);
}

export { fastify };

