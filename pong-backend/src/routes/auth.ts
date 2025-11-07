import db from '../../database/db.js'
import bcrypt from 'bcrypt';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { RegisterBody, User } from '../types/RegisterType.js';
import { AuthController } from '../controllers/authController.js';
import { guestPostSchema } from '../types/RouteGuest.js';
import { UsersModel } from '../models/usersModel.js';


export default async function authRoutes(fastify: FastifyInstance) {
    const authController = new AuthController();
    const usersModel = new UsersModel(db);

    fastify.post('/guest', {
        schema: { body: guestPostSchema },
        handler: authController.guestLogin.bind(authController)
    });

    fastify.post('/verify-2fa', authController.veryify2FA.bind(authController));

    fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, res: FastifyReply) => {
        const { email, username, password } = request.body;

        if (!email || !username || !password)
            return res.status(400).send({ error: 'all fields are mandatory' });


        // const resultat = existUser()

        const InstructionDBforFindUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?')
        const existingUser = InstructionDBforFindUser.get(email, username) as User | undefined;
        if (existingUser) {
            if (existingUser.email === email)
                return res.status(400).send({ error: 'Email already in use' })
            if (existingUser.username === username)
                return res.status(400).send({ error: 'Username already in use' })
        }

        const hash = await bcrypt.hash(password, 10);

        const insertNewUserInDB = db.prepare('INSERT INTO users (email, username, password) VALUES (?,?,?)');
        insertNewUserInDB.run(email, username, hash);

        return res.status(201).send({ message: 'success', payload: { code: undefined } });
    });
}
