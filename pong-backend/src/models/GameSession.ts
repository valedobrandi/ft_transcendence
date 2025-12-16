import Database from 'better-sqlite3'

class GameSessionDatabase {
    private stmActivateSession: Database.Statement;
    private stmSessionToken: Database.Statement;

    constructor(db: Database.Database) {
        this.stmActivateSession = db.prepare(`
            UPDATE game_sessions
            SET session_token = ?
            WHERE user_id = ?
        `);
        this.stmSessionToken = db.prepare(`
            SELECT session_token FROM game_sessions
            WHERE user_id = ?
        `);
    }

    activateSession(userId: number, sessionToken: string): void {
        this.stmActivateSession.run(sessionToken, userId);
    }

    getSessionToken(userId: number): string {
        const row = this.stmSessionToken.get(userId) as {session_token: string};
        return row ? row.session_token : '';
    }
}

export { GameSessionDatabase };
