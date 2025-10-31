import Database from 'better-sqlite3'

class UsersModel {
    private db: Database.Database;
    private stmFindUser: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?');
    }

    findUserByEmailOrUsername(email: string, username: string): any | undefined {
        return this.stmFindUser.get(email, username);
    }
}

export { UsersModel };