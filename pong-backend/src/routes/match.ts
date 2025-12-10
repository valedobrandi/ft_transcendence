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
import db from "../database/db.js";
import { UsersModel } from "../models/usersModel.js";
import fetch from "node-fetch";
import { print } from "../server.js";

import { SettingsType } from "../types/GameStateType.js";
import { GameSettings, PingPong, gameSettings } from "../classes/PingPong.js";

type RequestSettingsType = {
	settings: GameSettings;
}

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
					settings: {
						type: "object",
						properties: {
							ball: {
								type: "object",
								properties: {
									size: { type: "string" },
									speed: { type: "string" }
								}
							},
							paddle: {
								type: "object",
								properties: {
									height: { type: "string" },
									speed: { type: "string" }
								}
							},
							score: { type: "string" },
							IA: { type: "boolean" },
						},
					},
				},
				required: ["settings"],
			},
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

	async getMatchHistory(req: FastifyRequest<{ Querystring: { username: string } }>, res: FastifyReply) {
		if (!req.query.username) {
			return res.code(statusCode("NO_CONTENT")).send({ message: "error", data: "username required" });
		}
		const { message, data } = await this.matchesService.getMatchHistory(req.query.username);
		return res.code(statusCode("OK")).send({ message, data });
	}

	getMatch(req: FastifyRequest<{ Querystring: { matchId: string } }>, res: FastifyReply) {
		const { message, data } = this.matchesService.getMatch(req.query.matchId);
		return res.code(statusCode("OK")).send({ message, data });
	}

	sendMatchInvite(req: FastifyRequest<{ Body: { invitedId: number } }>, res: FastifyReply) {
		const { invitedId } = req.body;
		const { message, data } = this.matchesService.sendMatchInvite(
			req.userId,
			invitedId,
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

	createMatch(req: FastifyRequest<{ Body: RequestSettingsType }>, res: FastifyReply) {
		const { settings } = req.body as RequestSettingsType;
		
		const parsedSettings: SettingsType = {
			paddle: {
				height: gameSettings.paddle.height[settings.paddle.size],
				speed: gameSettings.paddle.speed[settings.paddle.speed],
			},
			ball: {
				size: gameSettings.ball.size[settings.ball.size],
				speed: gameSettings.ball.speed[settings.ball.speed],
			},
			score: gameSettings.score[settings.score],
			IA: settings.IA,
		};
		const { message, data } = this.matchesService.createMatch(req.userId, parsedSettings);

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
		print(`[MATCH HISTORY] Retrieved match history for user: ${JSON.stringify(match)}`);
		
		const matchesHistory: MatchesHistory = {
			wins: 0,
			loses: 0,
			history: [],
		};
		
		if (match === undefined || match.length === 0) {
		return { message: "success", data: matchesHistory};
		}

		for (const m of match) {
			const { score1, score2 } = await this.matchesModel.getScoreHardhat(m.match_id);
			print(`[BLOCKCHAIN] Fetched match score for match ID ${m.match_id}: ${score1}, ${score2}`);
			matchesHistory.history.push({
				player1: m.player1,
				score1: Number(score1),
				player2: m.player2,
				score2: Number(score2),
				createdAt: m.created_at,
			});
			if (m.player1 === username) {
				if (score1 > score2)
					matchesHistory.wins += 1;
				if (score1 < score2)
					matchesHistory.loses += 1;
			}
			if (m.player2 === username) {
				if (score1 < score2)
					matchesHistory.wins += 1;
				if (score1 > score2)
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

	createMatch(userId: number, settings: SettingsType) {
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

		if (settings.IA) {
			const newMatch = new PingPong(matchId, settings);
    		newMatch.createMatch(connected.username, 'PONG-IA');
			return {message: 'success', data: 'new game with IA started'}
		}

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

	sendMatchInvite(id: number, invitedId: number) {
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
			settings: undefined,
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
	private stmUpdateMatchPlayerUsername: Database.Statement;

	constructor(db: Database.Database) {
		this.db = db;
		this.stmGetMatchHistoryById = db.prepare(
			`SELECT match_id, player1, player2, created_at
			FROM matches
			WHERE player1 = ? OR player2 = ?
			ORDER BY created_at DESC;
			`
		);
		this.stmUpdateMatchPlayerUsername = db.prepare(
			`UPDATE matches
			SET player1 = CASE WHEN player1 = ? THEN ? ELSE player1 END,
				player2 = CASE WHEN player2 = ? THEN ? ELSE player2 END
			WHERE player1 = ? OR player2 = ?;
			`
		);
	}

	async getScoreHardhat(matchId: string) {
		try {
			const response = await fetch(`http://hardhat:3300/hardhat/${matchId}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json() as { score1: number; score2: number };
			const score1 = data.score1;
			const score2 = data.score2;
			return { score1, score2 };
		} catch (error) {
			print(`[BLOCKCHAIN ERROR] Failed to fetch match score for match ID ${matchId}: ${error}`);
			return { score1: 0, score2: 0 };
		}
	}

	async getMatchHistoryById(username: string): Promise<MatchesReturnDB[] | undefined> {
		const match = this.stmGetMatchHistoryById.all(username, username) as MatchesReturnDB[] | undefined;
		return match;
	}

	updateMatchPlayerUsername(oldUsername: string, newUsername: string) {
		this.stmUpdateMatchPlayerUsername.run(oldUsername, newUsername, oldUsername, newUsername, oldUsername, oldUsername);
	}
}

const matchServiceInstance = new MatchesService();

export { matchesRoute, matchServiceInstance, MatchesModel };
