import { FastifyPluginAsync } from 'fastify';
import { socketHandler } from '../sockets/index.js';
import WebSocket from 'ws';


const websocketRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/ws', { websocket: true }, (connection: WebSocket, req) => {
    socketHandler(connection, req);
  });
};

export default websocketRoute;
