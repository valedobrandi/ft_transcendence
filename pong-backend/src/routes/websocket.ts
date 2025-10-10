import { FastifyPluginAsync } from 'fastify';
import { socketHandler } from '../sockets/index.js';
import WebSocket from 'ws';
import fastifyWebsocket from '@fastify/websocket';


const websocketRoute: FastifyPluginAsync = async (fastify) => {
    await fastify.register(fastifyWebsocket);
    fastify.get('/ws', { websocket: true }, (connection: WebSocket, req) => {
        socketHandler(connection, req);
    });
};

export default websocketRoute;
