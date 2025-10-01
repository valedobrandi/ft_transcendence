import Fastify from 'fastify'; //'fastify' est le nom du paquet
import { players } from './data/userstat.js';
// active les logs
const fastify = Fastify({ logger: true });
// route GET (request = requête client, reply = réponse)
fastify.get('/', () => {
    return { hello: 'world' };
});
fastify.get('/player', () => {
    return players;
});
/** Run the server! */
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('Serveur sur http://localhost:3000');
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
