import db from '../db.js';
import bcrypt from 'bcrypt';

// Sample users
function hashed_password(password: string) {
	return bcrypt.hashSync(password, 10);
}

const users = [
	{
		username: 'INTRA',
		email: 'admin',
		password: hashed_password('admin'),
		twoFA_enabled: 0,
	},
	{
		username: 'john_doe',
		email: 'john_doe@example.com',
		password: hashed_password('123'),
		twoFA_enabled: 0,
	},
	{
		username: 'NoobMaster',
		email: 'NoobMaster@example.com',
		password: hashed_password('123'),
		twoFA_enabled: 0,
	},
	{
		username: 'bobMarley',
		email: 'bobMarley@example.com',
		password: hashed_password('123'),
		twoFA_enabled: 0,
	},
	{
		username: 'proGamer',
		email: 'proGamer@example.com',
		password: hashed_password('123'),
		twoFA_enabled: 0,
	},
	{
		username: 'aliceWonder',
		email: 'aliceWonder@example.com',
		password: hashed_password('123'),
		twoFA_enabled: 0,
	},
	{
		username: 'charlie123',
		email: 'charlie123@example.com',
		password: hashed_password('123'),
		twoFA_enabled: 0,
	},
	{
		username: 'lola',
		email: 'lola@example.com',
		password: bcrypt.hashSync('pass', 10),
		twoFA_enabled: 0,
	},
];


export async function seedUsers() {
	const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, twoFA_enabled)
    VALUES (@username, @email, @password, @twoFA_enabled)
  `);
	const insertMany = db.transaction((users) => {
		for (const user of users) insertUser.run(user);
	});

	insertMany(users);
}

