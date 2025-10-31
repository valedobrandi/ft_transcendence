import Database from "better-sqlite3";

const db = new Database('database.db');

const usersSchema = db.prepare("PRAGMA table_info(users)").all();
const users = db.prepare('SELECT * FROM users').all();

const matchsSchema = db.prepare("PRAGMA table_info(matches)").all();
const matchs = db.prepare('SELECT * FROM matches').all();

const friendsSchema = db.prepare("PRAGMA table_info(friends)").all();
const friends = db.prepare('SELECT * FROM friends').all();

console.log('🧬 Users Table Schema:')
console.table(usersSchema);
console.log('📋 Users Table:')
for (const user of users) {
    console.log(user);
}

console.log('🧬 Matchs Table Schema:')
console.table(matchsSchema);
console.log('📋 Matchs Table:')
for (const match of matchs) {
    console.log(match);
}

console.log('🧬 Friends Table Schema:')
console.table(friendsSchema);
console.log('📋 Friends Table:')
for (const friend of friends) {
    console.log(friend);
}