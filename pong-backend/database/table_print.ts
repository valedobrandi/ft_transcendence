import db from "./db.js";

const usersSchema = db.prepare("PRAGMA table_info(users)").all();
const users = db.prepare('SELECT * FROM users').all();

const matchsSchema = db.prepare("PRAGMA table_info(matches)").all();
const matchs = db.prepare('SELECT * FROM matches').all();

const friendsSchema = db.prepare("PRAGMA table_info(friends)").all();
const friends = db.prepare('SELECT * FROM friends').all();

const chatBlockSchema = db.prepare("PRAGMA table_info(chatBlock)").all();
const chatBlock = db.prepare('SELECT * FROM chatBlock').all();

const messagesSchema = db.prepare("PRAGMA table_info(messages)").all();
const messages = db.prepare('SELECT * FROM messages').all();

const eventsSchema = db.prepare("PRAGMA table_info(events)").all();
const events = db.prepare('SELECT * FROM events').all();


console.log('🧬 Users Table Schema:')
console.table(usersSchema);

console.log('🧬 Matchs Table Schema:')
console.table(matchsSchema);

console.log('🧬 Friends Table Schema:')
console.table(friendsSchema);

console.log('🧬 chatBlock Table Schema:')
console.table(chatBlockSchema);

console.log('🧬 Messages Table Schema:')
console.table(messagesSchema);

console.log('🧬 Events Table Schema:')
console.table(eventsSchema);

console.log('📋 Users Table:')
for (const user of users) {
    console.log(user);
}

console.log('📋 Matchs Table:')
for (const match of matchs) {
    console.log(match);
}

console.log('📋 Friends Table:')
for (const friend of friends) {
    console.log(friend);
}

console.log('📋 chatBlock Table:')
for (const chatblockuser of chatBlock) {
    console.log(chatblockuser);
}

console.log('📋 Messages Table:')
for (const message of messages) {
    console.log(message);
}

console.log('📋 Events Table:')
for (const event of events) {
    console.log(event);
}