import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { broadcastTournamentQueueUpdate, joinTournamentQueue, tournamentQueue } from "../state/tournamentRoom.js";

const tournamentsRoute = (fastify: FastifyInstance) => {
	const  tournamentController = new TournamentController();
	fastify.post("/tournament", {
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
		const { message, data } = this.tournamentService.quitTournamentQueue(Number(userId));

		return res.status(200).send({ message, data });
	}
}

class TournamentService {

	quitTournamentQueue(userId: number) {
		const isConnectedAtQueue = tournamentQueue.has(userId);
		if (isConnectedAtQueue) {
			tournamentQueue.delete(userId);
		}

		const connected = connectedRoomInstance.getById(userId);
		if (connected === undefined) {
			return { message: "error", data: "disconnected" };
		}

		broadcastTournamentQueueUpdate();

		connected.status = "CONNECTED";
		connectedRoomInstance.sendWebsocketMessage(connected.id, "CONNECTED");

		return { message: "success", data: "unsubscribed from tournament" };

	}

	joinTournament(userId: number) {
		const connected = connectedRoomInstance.getById(userId);
		if (connected === undefined) throw new Error("disconnected");

		if (connected.status !== "CONNECTED") {
			return { message: "error", data: "you are subscribed to a other match/tournament" };
		}

		connected.status = 'TOURNAMENT';
		connectedRoomInstance.sendWebsocketMessage(connected.id, "TOURNAMENT");
		joinTournamentQueue(Number(connected.id));

		return { message: 'success', data: "subscribed to tournament" }
	}
}

export { tournamentsRoute, TournamentService, TournamentController };