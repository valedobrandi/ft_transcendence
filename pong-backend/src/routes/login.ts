import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { RegisterBody, User } from '../types/RegisterType.js';
import { getIdUser, updatedUserInDB } from '../user_service/user_service.js';
import { playerStatus } from '../enum_status/enum_userStatus.js';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';
import db from '../../database/db.js'
import { AuthService } from '../services/authService.js';
import { AuthController } from '../controllers/authController.js';
import { UsersModel } from '../models/usersModel.js';
import cookie from '@fastify/cookie';

export default async function loginRoutes(fastify: FastifyInstance) {
    const authController = new AuthController();
    const usersModel = new UsersModel(db);

        fastify.post('/login', async (request: FastifyRequest<{ Body: RegisterBody }>, res: FastifyReply) => {
        const { username, password } = request.body;
        const authService = new AuthService();

        if (!username || !password) {
            return res.status(400).send({ error: 'All fields are mandatory' })
        }

        const existingUser = usersModel.findUserByEmailOrUsername(username) as User | undefined;
        if (existingUser === undefined) {
            return res.status(400).send({ error: 'Invalid credentials', existingUser })
        }

        const passwordMatches = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatches) {
          return res.status(401).send({ error: 'Invalid credentials' });
        }

        if (existingUser.twoFA_enabled) 
        {
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
        } 
        else
        {
            const payload = {id: existingUser.id ,email: existingUser.email, username: existingUser.username};

            const refreshToken = fastify.jwt.sign(payload, { expiresIn: '7d' });
            if(!refreshToken)
                return res.status(404).send({error: "RefreshToken not found"});

            db.prepare("UPDATE users SET refreshToken = ? WHERE id = ?").run(refreshToken, existingUser.id);

            const accessToken = fastify.jwt.sign(payload, { expiresIn: '10h' });
            if(!accessToken)
                return res.status(404).send({error: "AccessToken not found"});

            res.setCookie('refreshToken', refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "strict",
                path: '/'
            });

            return res.status(201).send({ message: 'success', payload: {accessToken, username}});
        }
    });
}
