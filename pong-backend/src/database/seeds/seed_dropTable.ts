import db from "../db";

export function drop_tables() {
    db.exec('BEGIN');
	db.exec(`DROP TABLE IF EXISTS messages`);
	db.exec(`DROP TABLE IF EXISTS matches`);
	db.exec(`DROP TABLE IF EXISTS friends`);
	db.exec(`DROP TABLE IF EXISTS users`);
	db.exec(`DROP TABLE IF EXISTS chatblock`);
	db.exec(`DROP TABLE IF EXISTS events`);
	db.exec('COMMIT');
}