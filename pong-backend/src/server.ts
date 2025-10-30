import Fastify from 'fastify';
import authRoutes from './routes/auth.js';
import matchRoute from './routes/match.js';
import friendRoute from './routes/friend.js';

import websocketRoute from './routes/websocket.js';

const fastify = Fastify({ logger: true });


fastify.register(authRoutes);
fastify.register(matchRoute);
fastify.register(friendRoute);
await fastify.register(websocketRoute);

export { fastify };

