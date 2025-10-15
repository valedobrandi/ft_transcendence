import Fastify from 'fastify';
import authRoutes from './routes/auth.js';

import websocketRoute from './routes/websocket.js';

const fastify = Fastify({ logger: true });


fastify.register(authRoutes);
await fastify.register(websocketRoute);

const start = async () => {
    try {
        await fastify.ready();
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

export { fastify };
