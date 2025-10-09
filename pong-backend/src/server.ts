import Fastify from 'fastify';
import authRoutes from './routes/auth.js';
import { startSchedulers } from './shedulers/sheduler.js';
import fastifyWebsocket from '@fastify/websocket';
import { socketHandler } from './sockets/index.js';

const fastify = Fastify({ logger: true });

await fastify.register(fastifyWebsocket);
fastify.register(authRoutes);

fastify.get('/ws', { websocket: true }, (connection, req) => {
    socketHandler(connection, req);
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        await fastify.ready();
        console.log('Serveur sur http://localhost:3000');
        startSchedulers();
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

export { fastify };
