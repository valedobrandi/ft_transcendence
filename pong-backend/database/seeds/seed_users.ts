import db from '../db.js';
import bcrypt from 'bcrypt';

// Sample users
const users = [
	{
		username: 'INTRA',
		email: 'admin',
		password: 'hashed_password_admin',
		status: 'disconnect',
		twoFA_enabled: 0,
	},
	{
		username: 'guest',
		email: 'guest@guest.com',
		password: 'hashed_password_3',
		status: 'disconnect',
		twoFA_enabled: 0,
	},
	{
		username: 'alice',
		email: 'alice@example.com',
		password: 'hashed_password_1',
		status: 'disconnect',
		twoFA_enabled: 1,
	},
	{
		username: 'bob',
		email: 'bob@example.com',
		password: 'hashed_password_2',
		status: 'disconnect',
		twoFA_enabled: 0,
	},
	{
		username: 'lola',
		email: 'lola@example.com',
		password: bcrypt.hashSync('pass', 10),
		status: 'disconnect',
		twoFA_enabled: 0,
	},
];


export async function seedUsers() {
	const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, status, twoFA_enabled)
    VALUES (@username, @email, @password, @status, @twoFA_enabled)
  `);
	const insertMany = db.transaction((users) => {
		for (const user of users) insertUser.run(user);
	});

	insertMany(users);
}

