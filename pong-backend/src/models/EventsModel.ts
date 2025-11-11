import Database from 'better-sqlite3'

type InsertEventReturn = {
    status: 'error' | 'success';
    data: { message: string };
};

class EventsModel {
    private db: Database.Database;
    private stmInsertEvent: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmInsertEvent = db.prepare(
            `INSERT INTO 
                events (type, from_id, to_id, payload) 
                VALUES (@type, @fromId, @toId, @payload)`);
    }

    insertEvent(type: string, fromId: number, toId: number, payload: string): InsertEventReturn {
        const response = this.stmInsertEvent.run({ type, fromId, toId, payload });
        if (response.changes === 1) {
            return { status: 'success', data: { message: 'event inserted' } };
        }
        return { status: 'error', data: { message: 'event not inserted' } };
    }
}
