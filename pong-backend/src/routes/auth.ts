import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { RegisterBody, User } from '../types/RegisterType.js';
import db from '../database/db.js'
import { AuthController } from '../controllers/authController.js';


export default async function authRoutes(fastify: FastifyInstance) {
	const authController = new AuthController();

	fastify.post('/verify-2fa', {
		schema: {
			body: {
				type: 'object',
				properties: {
					id: { type: 'number' },  // <-- FIX
					username: { type: 'string' },
					code: { type: 'string' }
				},
				required: ['id', 'username', 'code']
			},
		},
		handler: authController.veryify2FA.bind(authController)
	});

	fastify.get('/authenticate', {
		handler: authController.isAuthenticated.bind(authController)
	});

	fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, res: FastifyReply) => {
		
		const { email, username, password } = request.body;

		if (!email && !username && !password)
			return res.status(206).send({ status: 'error', message: 'All fields are mandatory' });
		if (!username)
			return res.status(206).send({ status: 'error', message: 'Username field is mandatory' });
		if (username.length < 3)
			return res.status(206).send({ status: 'error', message: 'Username must contain at least 3 characters' });
		if (!email)
			return res.status(206).send({ status: 'error', message: 'Email field is mandatory' });
		if (!password)
			return res.status(206).send({ status: 'error', message: 'Password field is mandatory' });
		// const resultat = existUser()

		const InstructionDBforFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?')
		const existingUser = InstructionDBforFindUser.get(email, username) as User | undefined;
		if (existingUser) {
			if (existingUser.email === email)
				return res.status(206).send({ status: 'error', message: 'Email already in use' })
			if (existingUser.username === username)
				return res.status(206).send({ status: 'error', message: 'Username already in use' })
		}

		const hash = await bcrypt.hash(password, 10);

		const insertNewUserInDB = db.prepare('INSERT INTO users (email, username, password) VALUES (?,?,?)');
		insertNewUserInDB.run(email, username, hash);

		return res.status(201).send({ message: 'success', payload: { code: undefined } });
	});
}
