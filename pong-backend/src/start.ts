import { fastify } from "./server.js";

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