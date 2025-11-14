import { FastifyRequest, FastifyInstance } from "fastify";
import {MatchBody, Match} from "../types/MatchType.js";
import { NewMatch, newMatchesQueue } from "../state/gameRoom.js";

const matchesRoute = (fastify: FastifyInstance) => {
    //create match
    fastify.post('/match', (request: FastifyRequest<{Body: MatchBody}>, reply) =>
    {
        
    });

    fastify.post('/create-match', {
        preHandler:[fastify.authenticate],
        schema:{},
    })
}

class MatchesService {
    createMatch(id: number, settings: {}) {
        const newMatch: NewMatch = {
            players: [id],
            settings: {}
        }
        newMatchesQueue.set(crypto.randomUUID(), newMatch);
    }   
}