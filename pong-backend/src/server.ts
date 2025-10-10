import Fastify from 'fastify';
import authRoutes from './routes/auth.js';
import { startSchedulers } from './shedulers/sheduler.js';
import websocketRoute from './routes/websocket.js';

const fastify = Fastify({ logger: true });


fastify.register(authRoutes);
await fastify.register(websocketRoute);

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        await fastify.ready();
        console.log('Connect at http://localhost:3000');
        startSchedulers();
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

export { fastify };
