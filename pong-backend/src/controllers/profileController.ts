import { FastifyRequest, FastifyReply } from 'fastify';
import { getIdUser, updatedUserInDB } from '../user_service/user_service';
import bcrypt from 'bcrypt';
import { UpdateBody } from '../types/ProfilType';
import { UsersModel } from '../models/usersModel.js';
import db from '../../database/db.js'
import { print } from '../server';
import { statusCode } from '../types/statusCode';

class ProfileControler {

    private profileService = new ProfileService();

    async updateUser(req: FastifyRequest<{ Params: { id: number }, Body: UpdateBody }>, res: FastifyReply) {
        const usersModel = new UsersModel(db);
        try {
            const { email, username, password } = req.body;
            const { id } = req.user as { id: number };

            const player = getIdUser(id);
            if (!player)
                return res.status(404).send({ error: 'user not found' });

            const checkUsernameAlready = usersModel.findUserByUsername(username);
            if (checkUsernameAlready)
                return res.status(408).send({ error: 'user already use' })
            const checkEmailAlready = usersModel.findUserByEmail(username);
            if (checkEmailAlready)
                return res.status(407).send({ error: 'Email already use' })

            if (email !== undefined)
                player.email = email;
            if (username !== undefined)
                player.username = username;

            if (password) {
                if (!req.body.current_password)
                    return res.status(422).send({ error: 'current_password required to change password' });
                const ok = await bcrypt.compare(req.body.current_password, player.password);
                if (!ok)
                    return res.status(401).send({ error: 'invalid current password' });
                player.password = await bcrypt.hash(password, 10);
            }
            // <-- BERNARDO START EDIT -->
            updatedUserInDB(player);
            // <-- BERNARDO END EDIT -->
            return res.status(200).send({ message: 'success', payload: { username, email } });
        }
        catch (error) {
            req.log.error(error);
            return res.status(statusCode("INTERNAL_SERVER_ERROR")).send({ error: 'Internal server error' });
        }
    }

    // <-- BERNARDO START EDIT -->
    async getProfileById(req: FastifyRequest<{Querystring: { id: number }}>, res: FastifyReply) {
        try {
            if (!req.query.id || isNaN(Number(req.query.id))) {
                return res.status(statusCode("NO_CONTENT")).send({ message: 'error', data: 'invalid id' });
            }

            const {message, data} = this.profileService.getProfileById(Number(req.query.id));
            if (message === 'error') {
                return res.status(204).send({message, data});
            }
            print(`[PROFILE] User profile fetched for ID: ${data}`);
            return res.status(200).send({ message, data });
        } catch (error) {
            const err = error as Error;
            return res.status(500).send({ error: err.message });
        }
    }
    // <-- BERNARDO END EDIT -->
}

class ProfileService {
    private usersModel = new UsersModel(db);

    getProfileById(id: number) {
        const { message, data } = this.usersModel.getProfileById(id);
        if (message === 'error') {
            return { message: 'error', data: 'user not found' };
        }
        const profileData = {
            id: data.id,
            username: data.username,
            avatar: data.avatar_url ? data.avatar_url : "",
        };
        return { message: 'success', data: profileData };
    }
}

export { ProfileControler }