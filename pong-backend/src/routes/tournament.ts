import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { joinTournamentQueue, tournamentQueue } from "../state/tournamentRoom.js";

const tournamentsRoute = (fastify: FastifyInstance) => {
	const  tournamentController = new TournamentController();
	fastify.get("/tournament/join", {
		preHandler: [fastify.authenticate],
		handler: tournamentController.joinTournament.bind(tournamentController)
	})

	fastify.get("/tournament/quit", {
		preHandler: [fastify.authenticate],
		handler: tournamentController.quitTournament.bind(tournamentController)
	});
}

class TournamentController {
	private tournamentService = new TournamentService();

	joinTournament(req: FastifyRequest, res: FastifyReply) {
		const userId = req.userId;

		const { message, data } = this.tournamentService.joinTournament(Number(userId));

		return res.status(200).send({ message, data });
	}

	quitTournament(req: FastifyRequest, res: FastifyReply) {
		const userId = req.userId;
		const { message, data } = this.tournamentService.quitTournament(Number(userId));

		return res.status(200).send({ message, data });
	}
}

class TournamentService {

	quitTournament(userId: number) {
		const isConnectedAtQueue = tournamentQueue.has(userId);

		if (isConnectedAtQueue) {
			tournamentQueue.delete(userId);
		}

		const connected = connectedRoomInstance.getById(userId);

		if (connected === undefined) {
			return { message: "error", data: "disconnected" };
		}

		connected.status = "CONNECT_ROOM";
		// Send back to CONNECT_ROOM
		connectedRoomInstance.sendWebsocketMessage(connected.id, "CONNECT_ROOM");

		return { message: "success", data: "left tournament" };

	}

	joinTournament(userId: number) {

		const connected = connectedRoomInstance.getById(userId);

		if (connected === undefined) throw new Error("disconnected");

		if (connected.status !== "CONNECT_ROOM") {
			return { message: "error", data: "is subscribed to a match/tournament" };
		}


		if (!connectedRoomInstance.sendWebsocketMessage(connected.id, "TOURNAMENT_ROOM")) {
			return { message: 'error', data: 'websocket disconnected' }
		}

		connected.status = 'TOURNAMENT_ROOM';

		joinTournamentQueue(Number(connected.id));

		return { message: 'success', data: "subscribed to tournament" }
	}
}

export { tournamentsRoute, TournamentService, TournamentController };