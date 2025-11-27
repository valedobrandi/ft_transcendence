import Database from "better-sqlite3";
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
import db from "../../database/db.js";
import { UsersModel } from "../models/usersModel.js";
import { tournamentContract } from "../server.js";

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
	fastify.delete("/match-cancel", {
		preHandler: [fastify.authenticate],
		schema: {
			querystring: {
				type: "object",
				properties: {
					matchId: { type: "string" },
				},
			},
		},
		handler: matcherController.removeMatch.bind(matcherController),
	});

	fastify.get("/match/join", {
		preHandler: [fastify.authenticate],
		schema: {
			querystring: {
				type: "object",
				properties: {
					matchId: { type: "string" },
				},
			},
		},
		handler: matcherController.joinMatch.bind(matcherController),
	});

	fastify.get<{ Querystring: { username: string } }>("/match/history", {
		preHandler: [fastify.authenticate],
		schema: {
			querystring: {
				type: "object",
				properties: {
					username: { type: "string" },
				},
				required: ["username"],
			},
		},
		handler: matcherController.getMatchHistory.bind(matcherController),
	});
};

class MatcherController {
	private matchesService: MatchesService;

	constructor() {
		this.matchesService = new MatchesService();
	}

	getMatchHistory(req: FastifyRequest<{ Querystring: { username: string } }>, res: FastifyReply) {
		if (!req.query.username) {
			return res.code(statusCode("NO_CONTENT")).send({ message: "error", data: "username required" });
		}
		const { message, data } = this.matchesService.getMatchHistory(req.query.username);
		return res.code(statusCode("OK")).send({ message, data });
	}

	getMatch(req: FastifyRequest<{ Querystring: { matchId: string } }>, res: FastifyReply) {
		const { message, data } = this.matchesService.getMatch(req.query.matchId);
		return res.code(statusCode("OK")).send({ message, data });
	}

	sendMatchInvite(req: FastifyRequest<{Body: {invitedId: number, settings: object}}>, res: FastifyReply) {
		const { invitedId, settings } = req.body;
		const { message, data } = this.matchesService.sendMatchInvite(
			req.userId,
			invitedId,
			settings
		);
		return res.code(statusCode("OK")).send({ message, data });
	}

	matchRemove(req: FastifyRequest<{ Querystring: { matchId: string } }>, res: FastifyReply) {
		const { matchId } = req.query;

		const { message, data } = this.matchesService.matchRemove(matchId, req.userId);
		return res.code(statusCode("OK")).send({ message, data });
	}

	acceptMatchInvite(req: FastifyRequest<{ Querystring: { matchId: string } }>, res: FastifyReply) {
		const { matchId } = req.query;

		const { message, data } = this.matchesService.acceptMatchInvite(
			req.userId,
			matchId
		);

		return res.code(statusCode("OK")).send({ message, data });
	}

	createMatch(req: FastifyRequest<{Body: {settings: any}}>, res: FastifyReply) {
		const { settings } = req.body;
		const { message, data } = this.matchesService.createMatch(req.userId, settings);
		return res.code(statusCode("OK")).send({ message, data });
	}

	removeMatch(req: FastifyRequest<{ Querystring: { matchId: string } }>, res: FastifyReply) {
		const { matchId } = req.query;
		const { message, data } = this.matchesService.removeMatch(req.userId, matchId);
		return res.code(statusCode("OK")).send({ message, data });
	}

	joinMatch(req: FastifyRequest<{ Querystring: { matchId: string } }>, res: FastifyReply) {
		const { matchId } = req.query;
		const { message, data } = this.matchesService.joinMatch(req.userId, matchId);
		return res.code(statusCode("OK")).send({ message, data });
	}
}
type MatchesHistory = {
	wins: number;
	loses: number;
	history: {
		player1: string;
		score1: number;
		player2: string;
		score2: number;
		createdAt: string;
	}[]
}

class MatchesService {

	private matchesModel = new MatchesModel(db);
	private usersModel = new UsersModel(db);

	async getMatchHistory(username: string) {
		const match = await this.matchesModel.getMatchHistoryById(username);
		if (match === undefined) {
			return { message: "error", data: "no match history" };
		}

		const matchesHistory: MatchesHistory = {
			wins: 0,
			loses: 0,
			history: [],
		};

		for (const m of match) {
			const { score1, score2 } = await this.matchesModel.getScoreBlockchain(m.match_id);
			matchesHistory.history.push({
				player1: m.player1,
				score1: score1,
				player2: m.player2,
				score2: score2,
				createdAt: m.created_at,
			});
			if(m.player1 === username)
			{
				if (m.score1 > m.score2)
					matchesHistory.wins += 1;
				if (m.score1 < m.score2)
					matchesHistory.loses += 1;
			}
			if(m.player2 === username)
			{
				if (m.score1 < m.score2)
					matchesHistory.wins += 1;
				if (m.score1 > m.score2)
					matchesHistory.loses += 1;
			}
		}

		return { message: "success", data: matchesHistory };
	}

	removeMatch(userId: number, matchId: string) {
		const connected = connectedRoomInstance.getById(userId);
		if (connected === undefined) throw new Error("disconnected");

		const nextMatch = newMatchesQueue.get(matchId);

		if (nextMatch?.createId !== userId) {
			return { message: "error", data: "FORBIDDEN" };
		}

		if (nextMatch === undefined) {
			return { message: "error", data: "match not find" };
		}

		newMatchesQueue.delete(matchId);
		connected.matchId = undefined;
		connected.status = "CONNECT_ROOM";

		connectedRoomInstance.sendWebsocketMessage(userId, "CONNECT_ROOM");
		connectedRoomInstance.broadcastNewMatchesList();

		return { message: "success", data: "match canceled" };
	}

	joinMatch(userId: number, matchId: string) {
		const connected = connectedRoomInstance.getById(userId);
		if (connected === undefined) throw new Error("disconnected");

		if (connected.status !== "CONNECT_ROOM") {
			return { message: "error", data: "already subscribed to a match/tournament" };
		}

		const nextMatch = newMatchesQueue.get(matchId);

		if (nextMatch === undefined) {
			return { message: "error", data: "match not find" };
		}

		if (nextMatch.players.length > 1) {
			return { message: "error", data: "match already start" };
		}

		nextMatch.players.push({ id: Number(connected.id), username: connected.username });

		newMatchesQueue.delete(matchId);
		connectedRoomInstance.broadcastNewMatchesList();
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
		const connected = connectedRoomInstance.getById(userId);
		if (connected === undefined) throw new Error("disconnected");

		if (newMatchesQueue.has(connected.matchId || "")) {
			return {
				message: "error",
				data: "you have a match created",
			};
		}

		if (connected.status !== "CONNECT_ROOM") {
			return {
				message: "error",
				data: "has a subscribed to match/tournament",
			};
		}

		const matchId = crypto.randomUUID();
		connected.matchId = matchId;
		connected.status = "MATCH_QUEUE";

		connectedRoomInstance.sendWebsocketMessage(userId, "MATCH_QUEUE");

		const newMatch: NewMatch = {
			createId: userId,
			players: [{ id: Number(connected.id), username: connected.username }],
			matchId,
			settings,
			status: "OPEN",
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
export type MatchesReturnDB = {
	match_id: string;
	player1: string;
	player2: string;
	score1: number;
	score2: number;
	match_status: string;
	created_at: string;
};

class MatchesModel {
	private db: Database.Database;
	private stmGetMatchHistoryById: Database.Statement;

	constructor(db: Database.Database) {
		this.db = db;
		this.stmGetMatchHistoryById = db.prepare(
			`SELECT match_id, player1, player2, score1, score2, created_at
			FROM matches
			WHERE player1 = ? OR player2 = ?
			ORDER BY created_at DESC;
			`
		);
	}

	async getScoreBlockchain(matchid: string) {
		try {
			const [score1, socre2] = await tournamentContract.getMatchScore(matchid);
			return { score1: score1.toNumber(), score2: socre2.toNumber() };
		} catch (error) {
			console.error('Error getting match score from blockchain:', error);
			throw error;
		}
	}

	async getMatchHistoryById(username: string): Promise<MatchesReturnDB[] | undefined> {
		const match = this.stmGetMatchHistoryById.all(username, username) as MatchesReturnDB[] | undefined;
		return match;
	}
}

const matchServiceInstance = new MatchesService();

export { matchesRoute, matchServiceInstance };
