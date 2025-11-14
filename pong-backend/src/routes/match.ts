import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import {MatchBody, Match} from "../types/MatchType.js";
import { NewMatch, newMatchesQueue } from "../state/gameRoom.js";

const matchesRoute = (fastify: FastifyInstance) => {

	const matcherController = new MAtcherController();

	fastify.post('/match', (request: FastifyRequest<{Body: MatchBody}>, responser: FastifyReply) =>
    {

    });

    fastify.post('/create-match', {
        preHandler:[fastify.authenticate],
        schema:matcherController.createMatch.bind(matcherController),
    })
}

class MAtcherController {
	private matchesService: MatchesService;

	constructor() {
		this.matchesService = new MatchesService();
	}

	createMatch(id: number, settings: {}) {
		return this.matchesService.createMatch(id, settings);
	}
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

export { matchesRoute };