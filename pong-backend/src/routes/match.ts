import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import {
	inviteMatchesQueue,
	NewInviteMatch,
	NewMatch,
	newMatchesQueue,
	startNewMatch,
} from "../state/gameRoom.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { statusCode } from "../types/statusCode.js";

const matchesRoute = (fastify: FastifyInstance) => {
	const matcherController = new MatcherController();

	fastify.get("/match-invite-accept", {
		preHandler: [fastify.authenticate],
		schema: {
			querystring: {
				type: "object",
				properties: {
					matchId: { type: "string" },
				},
			},
		},
		handler: matcherController.acceptMatchInvite.bind(matcherController),
	});

	fastify.get("/match-invite", {
		preHandler: [fastify.authenticate],
		schema: {
			querystring: {
				type: "object",
				properties: {
					matchId: { type: "string" },
				},
			},
		},
		handler: matcherController.getMatch.bind(matcherController),
	});

	fastify.post("/match-invite", {
		preHandler: [fastify.authenticate],
		schema: {
			body: {
				type: "object",
				properties: {
					invitedId: { type: "number" },
					settings: { type: "object" },
				},
			},
		},
		handler: matcherController.sendMatchInvite.bind(matcherController),
	});

	fastify.delete("/match-invite", {
		preHandler: [fastify.authenticate],
		schema: {
			querystring: {
				type: "object",
				properties: {
					matchId: { type: "string" },
				},
			},
		},
		handler: matcherController.matchRemove.bind(matcherController),
	});

	fastify.post("/match-create", {
		preHandler: [fastify.authenticate],
		schema: {
			body: {
				type: "object",
				properties: {
					settings: { type: "object" },
				},
			},
			require: ["settings"],
		},
		handler: matcherController.createMatch.bind(matcherController),
	});
};

class MatcherController {
	private matchesService: MatchesService;

	constructor() {
		this.matchesService = new MatchesService();
	}

	getMatch(req: FastifyRequest, res: FastifyReply) {
		const { matchId } = req.query;
		const { message, data } = this.matchesService.getMatch(matchId);
		return res.code(statusCode("OK")).send({ message, data });
	}

	sendMatchInvite(req: FastifyRequest, res: FastifyReply) {
		const { id } = req.user;
		const { invitedId, settings } = req.body;
		const { message, data } = this.matchesService.sendMatchInvite(
			id,
			invitedId,
			settings
		);
		return res.code(statusCode("OK")).send({ message, data });
	}

	matchRemove(req: FastifyRequest, res: FastifyReply) {
		const { id } = req.user;
		const { matchId } = req.query;

		const { message, data } = this.matchesService.matchRemove(matchId, id);
		return res.code(statusCode("OK")).send({ message, data });
	}

	acceptMatchInvite(req: FastifyRequest, res: FastifyReply) {
		const { id } = req.user;
		const { matchId } = req.query;

		const { message, data } = this.matchesService.acceptMatchInvite(
			id,
			matchId
		);

		return res.code(statusCode("OK")).send({ message, data });
	}

	createMatch(req: FastifyRequest, res: FastifyReply) {
		const { id } = req.user;
		const { settings } = req.body;
		const { message, data } = this.matchesService.createMatch(id, settings);
		return res.code(statusCode("OK")).send({ message, data });
	}
}

class MatchesService {
	joinMatch(userId: number, matchId: string) {
		const getUser = connectedRoomInstance.getById(userId);
		if (getUser === undefined) throw new Error("disconnected");

		if (getUser.status !== "CONNECT_ROOM") {
			return { message: "error", data: "already subscribed to a match/tournament" };
		}

		const nextMatch = newMatchesQueue.get(matchId);

		if (nextMatch === undefined) {
			return { message: "error", data: "match not find" };
		}

		if (nextMatch.players.length > 1) {
			return { message: "error", data: "match already start" };
		}

		nextMatch.players.push({ id: Number(getUser.id), username: getUser.username });

		const { data, message } = startNewMatch(nextMatch);

		return { message, data };
	}

	acceptMatchInvite(userId: number, matchId: string) {

		const getUser = connectedRoomInstance.getById(userId);
		if (getUser === undefined) throw new Error("disconnected");

		if (getUser.status !== "MATCH_INVITE") {
			return { message: "error", data: `subscribed to ${getUser.status}` };
		}

		const nexMatch = inviteMatchesQueue.get(matchId);
		
		inviteMatchesQueue.delete(matchId);

		if (nexMatch === undefined) {
			return { message: "error", data: "match not find" };
		}

		nexMatch.players.push({ id: Number(getUser.id), username: getUser.username });

		const { data, message } = startNewMatch(nexMatch);
		// Notify the two players
		if (nexMatch !== undefined && message === "success") {
			for (const ids of [nexMatch.from, nexMatch.to]) {
				const getPlay = connectedRoomInstance.getById(Number(ids));
				if (getPlay && getPlay.socket) {
					getPlay.socket.send(
						JSON.stringify({
							status: 200,
							message: "invite:accept",
							payload: {
								matchId,
							},
						})
					);
				}
			}
		}

		return { data, message };
	}

	createMatch(userId: number, settings: {}) {
		const getUser = connectedRoomInstance.getById(userId);
		if (getUser === undefined) throw new Error("disconnected");

		if (newMatchesQueue.has(getUser.matchId || "")) {
			return {
				message: "error",
				data: "you have a match created",
			};
		}

		if (getUser.status !== "CONNECT_ROOM") {
			return {
				message: "error",
				data: "has a subscribed to match/tournament",
			};
		}

		const matchId = crypto.randomUUID();
		getUser.matchId = matchId;
		getUser.status = "MATCH_QUEUE";

		connectedRoomInstance.sendWebsocketMessage(userId, "MATCH_QUEUE");

		const newMatch: NewMatch = {
			createId: userId,
			players: [{ id: Number(getUser.id), username: getUser.username }],
			matchId,
			settings,
			status: "WAITING",
		};

		newMatchesQueue.set(matchId, newMatch);
		connectedRoomInstance.broadcastNewMatchesList();

		return { message: "success", data: "new game created" };
	}


	getMatch(matchId: string) {
		const match = inviteMatchesQueue.get(matchId);
		if (match === undefined) {
			return { message: "error", data: "match not found" };
		}
		return {
			message: "success",
			data: {
				message: "match found",
				matchId: matchId,
				from: match.from,
				to: match.to,
			},
		};
	}

	matchRemove(matchId: string, userId: number) {
		const match = inviteMatchesQueue.get(matchId);
		if (match === undefined) {
			return { message: "error", data: "match not found" };
		}

		for (const matchUser of [match.from, match.to]) {
			const requestUser = connectedRoomInstance.getById(Number(matchUser));
			if (requestUser && requestUser.socket) {
				requestUser.matchId = undefined;
				requestUser.status = "CONNECT_ROOM";
				requestUser.socket.send(
					JSON.stringify({
						status: 200,
						message: "MATCH_DECLINED",
						payload: {
							from: userId,
							matchId: matchId,
						},
					})
				);
			}
		}
		if (inviteMatchesQueue.delete(matchId)) {
			return { message: "success", data: "invitation canceled" };
		}

		return { message: "error", data: "unable to cancel invitation" };
	}

	sendMatchInvite(id: number, invitedId: number, settings: {}) {
		const connected = connectedRoomInstance.getById(id);
		if (connected === undefined) {
			return { message: "error", data: "user disconnected" };
		}

		const matchId = crypto.randomUUID();

		const newMatch: NewInviteMatch = {
			players: [{ id: id, username: connected.username }],
			matchId,
			from: id,
			to: invitedId,
			settings: settings,
		};

		for (const playerId of [invitedId, id]) {
			let userInstance = connectedRoomInstance.getById(playerId);
			if (userInstance === undefined) {
				return { message: "error", data: "user disconnected" };
			}

			if (playerId === id) {
				if (userInstance.status !== "CONNECT_ROOM") {
					return {
						message: "error",
						data: "cannot send invite in current status",
					};
				}
				userInstance.status = "SEND_INVITE";
			}
			userInstance.matchId = matchId;

			if (playerId === invitedId) {
				if (userInstance.status !== "CONNECT_ROOM") {
					return {
						message: "error",
						data: "cannot receive invite in current status",
					};
				}
				userInstance.status = "MATCH_INVITE";
				if (userInstance.socket) {
					userInstance.socket.send(
						JSON.stringify({
							status: 200,
							message: "MATCH_INVITE",
							payload: {
								from: id,
								matchId: matchId,
								settings: settings,
							},
						})
					);
				}
			}
		}

		inviteMatchesQueue.set(matchId, newMatch);
		return {
			message: "success",
			data: { message: "invite sent", matchId: matchId },
		};
	}
}

const matchServiceInstance = new MatchesService();

export { matchesRoute, matchServiceInstance };
