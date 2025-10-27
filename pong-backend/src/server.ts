import Fastify from 'fastify';
import authRoutes from './routes/auth.js';

import websocketRoute from './routes/websocket.js';

const fastify = Fastify({ logger: true });


fastify.register(authRoutes);
await fastify.register(websocketRoute);

export { fastify };

