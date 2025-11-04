import Database from 'better-sqlite3'

class MatchesModel {
    private db: Database.Database;
    private stmSaveMatch: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmSaveMatch = db.prepare(
            `INSERT INTO matches 
                (match_id, player1, player2, score1, score2) 
                VALUES (?, ?, ?, ?, ?)`);
    }

    saveMatch(machId: string, player1: string, player2: string,
        player1Score: number, player2Score: number
    ): void {
        try {
            this.stmSaveMatch.run(
                machId, player1, player2,
                player1Score, player2Score);
        } catch (error) {
            console.error('Error saving match:', error);
            throw error;
        }
    }
}

export default MatchesModel;
