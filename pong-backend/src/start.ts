import db from "../database/db.js";
import { GameEvents } from "./events/gameEvents.js";
import MatchesModel from "./models/matchesModel.js";
import { fastify } from "./server.js";

const start = async () => {
	try {
		await fastify.ready();
		const matchesModel = new MatchesModel(db);
		GameEvents.registerListeners(matchesModel)
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();