import Database from 'better-sqlite3'
import { tournamentContract } from '../server';

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
			const tx = await tournamentContract.saveMatch(machId, player1Score, player2Score)
			await tx.wait();

			this.stmSaveMatch.run(
				machId, player1, player2);
		} catch (error) {
			console.error('Error saving match:', error);
		}
	}
}

export default MatchesModel;
