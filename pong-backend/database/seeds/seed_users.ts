import { playerStatus } from '../../src/enum_status/enum_userStatus.js';
import db from '../db.js';

// Sample users
const users = [
	{
		username: 'INTRA',
		email: 'admin',
		password: 'hashed_password_admin',
		status: playerStatus.DISCONNECT,
		twoFA_enabled: 0,
	},
	{
		username: 'guest',
		email: 'guest@guest.com',
		password: 'hashed_password_3',
		status: playerStatus.DISCONNECT,
		twoFA_enabled: 0,
	},
	{
		username: 'alice',
		email: 'alice@example.com',
		password: 'hashed_password_1',
		status: playerStatus.DISCONNECT,
		twoFA_enabled: 1,
	},
	{
		username: 'bob',
		email: 'bob@example.com',
		password: 'hashed_password_2',
		status: playerStatus.DISCONNECT,
		twoFA_enabled: 0,
	},
];


export function seedUsers() {
	const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, status, twoFA_enabled)
    VALUES (@username, @email, @password, @status, @twoFA_enabled)
  `);
	const insertMany = db.transaction((users) => {
		for (const user of users) insertUser.run(user);
	});

	insertMany(users);
}

