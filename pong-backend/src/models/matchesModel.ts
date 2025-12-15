import Database from 'better-sqlite3'
import fetch from "node-fetch";
import { print } from '../server.js';

class MatchesModel {
	private db: Database.Database;
	private stmSaveMatch: Database.Statement;

	constructor(db: Database.Database) {
		this.db = db;
		this.stmSaveMatch = db.prepare(
			`INSERT INTO matches
                (match_id, player1, player2)
                VALUES (?, ?, ?)`);
	}

	async saveMatch(
		machId: string,
		player1: string,
		player2: string,
		player1Score: number,
		player2Score: number
	): Promise<void> {
		try {
			const response = await fetch(`http://hardhat:3300/hardhat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					matchId: machId,
					score1: player1Score,
					score2: player2Score,
				}),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			//print(`[BLOCKCHAIN] Match ${machId} saved on blockchain. ${JSON.stringify(data)}`);
			this.stmSaveMatch.run(
				machId, player1, player2);
		} catch (error) {
			console.error('Error saving match:', error);
		}
	}
}

export default MatchesModel;
