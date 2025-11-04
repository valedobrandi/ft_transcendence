import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { RegisterBody, User } from '../types/RegisterType.js';
import { getIdUser, updatedUserInDB } from '../user_service/user_service.js';
import { playerStatus } from '../enum_status/enum_userStatus.js';
import db from '../../database/db.js';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';
import { AuthService } from '../services/authService.js';
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

        return res.status(201).send({ message: 'connected', payload: { code: undefined } });
    });

    fastify.post('/login', async (request: FastifyRequest<{ Body: RegisterBody }>, res: FastifyReply) => {
        const { email, username, password } = request.body;
        const authService = new AuthService();
        if (!email || !username || !password) {
            return res.status(400).send({ error: 'All fields are mandatory' })
        }

        const existingUser = usersModel.findUserByEmailOrUsername(username, email) as User | undefined;
        if (existingUser === undefined) {
            return res.status(400).send({ error: 'Invalid credentials' })
        }

        const passwordMatches = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatches) {
          return res.status(401).send({ error: 'Invalid credentials' });
        }

        if (existingUser.twoFA_enabled) {
            const authRoom = authenticationRoomInstance;
            authRoom.add(existingUser.username, AuthService.generate2FACode());

            const { data, error } = await authService.sendEmail(
                existingUser.email,
                'ft_transcendence Ping-Pong 2FA Code',
                `<p>Your 2FA code is: <strong>${authRoom.getCode(existingUser.username)}</strong></p>`
            );
            if (error) {
                return res.status(400).send({ error });
            } else {
                return res.status(200).send({ message: data });
            }
        } else {
            return res.status(201).send({ message: 'user connected' });
        }
    });

    fastify.post('/user/:id', async (request: FastifyRequest<{ Params: { id: number }, Body: RegisterBody }>, reply) => {
        const { email, username, password } = request.body;
        const { id } = request.params;

        const player = getIdUser(id);
        if (!player)
            return reply.status(404).send({ error: 'user not found' });


        console.log(player.status, ' AND ', playerStatus.DISCONNECT.toString());
        if (player.status === playerStatus.DISCONNECT.toString()) {

            return reply.status(400).send({ error: 'Player Disconnected' });
        }


        player.email = email ?? player.email;
        player.username = username ?? player.username;


        if (password) {
            const hash = await bcrypt.hash(password, 10);
            player.password = hash;
            console.log("change mot de pass");
        }

        try {
            updatedUserInDB(player);
            return reply.status(200).send({ message: 'Profile updated successfully', user: player });
        }
        catch (error) {
            const err = error as Error;
            return reply.status(404).send({ error: err.message });
        }
    });
}
