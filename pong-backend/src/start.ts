import { fastify } from "./server.js";
import 'dotenv/config';

const start = async () => {
    try {
        await fastify.ready();
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        console.error(err);
        fastify.log.error(err);
        process.exit(1);
    }
};

start();