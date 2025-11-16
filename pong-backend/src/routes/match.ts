import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import { inviteMatchesQueue, NewMatch } from "../state/gameRoom.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { PlayerType } from "../types/PlayerType.js";
import { statusCode } from "../types/statusCode.js";
import { print } from "../server.js";

const matchesRoute = (fastify: FastifyInstance) => {

    const matcherController = new MatcherController();

    fastify.post('/match-invite', {
        preHandler: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                properties: {
                    invitedId: { type: 'number' },
                    settings: { type: 'object' }
                }
            }
        },
        handler: matcherController.createMatch.bind(matcherController),
    })

    fastify.delete('/match-invite', {
        preHandler: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    matchId: { type: 'string' }
                }
            }
        },
        handler: matcherController.denyMatch.bind(matcherController)
    })

    fastify.get('/match-invite', {
        preHandler: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    matchId: { type: 'string' }
                }
            }
        },
        handler: matcherController.getMatch.bind(matcherController),
    })
}

class MatcherController {
    private matchesService: MatchesService;

    constructor() {
        this.matchesService = new MatchesService();
    }

    getMatch(req: FastifyRequest, res: FastifyReply) {
        const { matchId } = req.query;
        const {message, data} = this.matchesService.getMatch(matchId);
        return res.code(statusCode('OK')).send({message, data});
    }

    createMatch(req: FastifyRequest, res: FastifyReply) {
        const { id } = req.user;
        const { invitedId, settings } = req.body;
        const { message, data } = this.matchesService.createMatch(id, invitedId, settings);
        return res.code(statusCode('OK')).send({ message, data });
    }

    denyMatch(req: FastifyRequest, res: FastifyReply) {
        const { id } = req.user;
        const { matchId } = req.query;

        const { message, data } = this.matchesService.denyMatch(matchId, id);
        return res.code(statusCode('OK')).send({ message, data });
    }
}

class MatchesService {

    getMatch(matchId: string) {
        const match = inviteMatchesQueue.get(matchId);
        if (match === undefined) {
            return {message: 'error', data: 'match not found'};
        }
        return {message: 'success', data: {message: 'match found', matchId: matchId, from:match.from, to:match.to}};
    }

    denyMatch(matchId: string, userId: number) {
        const match = inviteMatchesQueue.get(matchId);
        if (match === undefined) {
            return { message: 'success', data: "match not found" };
        }
        
        for (const matchUser of [match.from, match.to]) {
            const requestUser = connectedRoomInstance.getById(Number(matchUser));
            if (requestUser && requestUser.socket) {
                requestUser.matchId = undefined;
                requestUser.status = "CONNECT_ROOM";
                requestUser.socket.send(JSON.stringify({
                    status: 200,
                    message: 'MATCH_DECLINED',
                    payload: {
                        from: userId,
                        matchId: matchId
                    }
                }))
            }
        }
        inviteMatchesQueue.delete(matchId);
        return { message: 'success', data: "invitation canceled" }
    }

    createMatch(id: number, invitedId: number, settings: {}) {
        const newMatch: NewMatch = {
            players: [id],
            from: id,
            to: invitedId,
            settings: settings
        }
        const matchId = crypto.randomUUID();

        for (const playerId of [invitedId, id]) {
            let userInstance = connectedRoomInstance.getById(playerId);
            if (userInstance === undefined) {
                return { message: 'error', data: "user disconnected" };
            };

            if (playerId === id) {
                if (userInstance.status !== 'CONNECT_ROOM') {
                    return { message: 'error', data: "you need to be in CONNECT_ROOM status" };
                }
                userInstance.status = 'SEND_INVITE';
            }
            userInstance.matchId = matchId;

            if (playerId === invitedId) {
                if (userInstance.status !== 'CONNECT_ROOM') {
                    return { message: 'error', data: "user is not in CONNECT_ROOM status" };
                }
                userInstance.status = "MATCH_INVITE";
                if (userInstance.socket) {
                    userInstance.socket.send(JSON.stringify({
                        status: 200,
                        message: 'MATCH_INVITE',
                        payload: {
                            from: id,
                            matchId: matchId,
                            settings: settings
                        }
                    }));
                }
            }
        };

        inviteMatchesQueue.set(matchId, newMatch);
        return { message: 'success', data: {message: "invite sent", matchId: matchId} };
    }
}

const matchServiceInstance = new MatchesService();

export { matchesRoute, matchServiceInstance };