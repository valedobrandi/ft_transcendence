import Fastify from 'fastify';
const fastify = Fastify({ logger: true });
// Route POST /players : inscription d’un joueur
fastify.post('/players', {
    schema: {
        body: {
            type: 'object',
            properties: {
                alias: { type: 'string' }
            },
            required: ['alias']
        },
        response: {
            201: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    alias: { type: 'string' }
                }
            }
        }
    },
    handler: async (request, reply) => {
        const { alias } = request.body;
        const newPlayer = { id: 1, alias };
        reply.code(201).send(newPlayer);
    }
});
// Démarrage du serveur
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Serveur lancé sur http://localhost:3000');
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start;
//# sourceMappingURL=server.js.map