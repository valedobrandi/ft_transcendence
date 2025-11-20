import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { connectedRoomInstance } from "../state/ConnectedRoom";
import { joinTournamentQueue } from "../state/tournamentRoom";

const tournamentsRoute = (fastify: FastifyInstance) => {
	fastify.post("/tournament-join", {
		preHandler: [fastify.authenticate],
		handler: () => { }
	})
}

class TournamentController {
	private tournamentService = new TournamentService();

	joinTournament(req: FastifyRequest, res: FastifyReply) {
		const userId = req.user;

		const { message, data } = this.tournamentService.joinTournament(Number(userId));

		return res.status(200).send({ message, data });
	}
}

class TournamentService {
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