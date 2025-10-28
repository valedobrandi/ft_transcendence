import Fastify from 'fastify';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import websocketRoute from './routes/websocket.js';

const fastify = Fastify({ logger: true });

fastify.register(authRoutes);
fastify.register(matchRoute);
await fastify.register(websocketRoute);

export function print(message: string) {
    fastify.log.info(message);
}

export { fastify };

