import { FastifyRequest, FastifyReply } from 'fastify';
import { getIdUser, updatedUserInDB, updateEmail, updatePassword, updateUsername } from '../user_service/user_service.js';
import bcrypt from 'bcrypt';
import { UpdateBody } from '../types/ProfilType.js';
import { UsersModel } from '../models/usersModel.js';
import db from '../database/db.js'
import { print } from '../server.js';
import { statusCode } from '../types/statusCode.js';
import { connectedRoomInstance } from '../state/ConnectedRoom.js';
import { MatchesModel } from '../routes/match.js';

class ProfileControler {

    private profileService = new ProfileService();
    private matchesModel = new MatchesModel(db);

    async updateUser(req: FastifyRequest<{ Params: { id: number }, Body: UpdateBody }>, res: FastifyReply) {
        const usersModel = new UsersModel(db);
        try {

            const player = getIdUser(req.userId);
            if (!player) {
                return res.status(404).send({ error: 'user not found' });
            }

            const connected = connectedRoomInstance.getById(req.userId);

            if (connected && connected.status !== "CONNECTED")
            {
                return res.status(200).send({ error: 'user is in a match or a tournament' });
            }

            if (req.body.username)
            {
                const exists = usersModel.findUserByUsername(req.body.username);
                if (exists) {
                    return res.status(200).send({ error: 'username already used' });
                }
                updateUsername(req.body.username, req.userId);
            }

            if (req.body.email) 
            {
                const exists = usersModel.findUserByEmail(req.body.email);
                if (exists) {
                    return res.status(200).send({ error: 'email already used' });
                }
                updateEmail(req.body.email, req.userId);
            }

            if (req.body.password)
            {
                if (!req.body.current_password) {
                    return res.status(200).send({ error: 'current_password required' });
                }

                const ok = await bcrypt.compare(
                    req.body.current_password,
                    player.password
                );

                if (!ok) {
                    return res.status(200).send({ error: 'invalid current password' });
                }

                await updatePassword(req.body.password, req.userId);
            }


            const { message, data } = usersModel.getProfileById(req.userId);

            if (message === 'success') {

                if (connected) {
                    connected.username = data.username;
                }

                connectedRoomInstance.broadcastRegisteredUsers();
                this.matchesModel.updateMatchPlayerUsername(player.username, data.username);

                return res.status(200).send({ message: 'success', payload: { username: data.username, email: data.email } });
            }

            return res.status(404).send({ error: 'user not found' });

        }
        catch (error) {
            req.log.error(error);
            return res.status(statusCode("INTERNAL_SERVER_ERROR")).send({ error: 'Internal server error' });
        }
    }

    // <-- BERNARDO START EDIT -->
    async getProfileById(req: FastifyRequest<{ Querystring: { id: number } }>, res: FastifyReply) {
        try {
            if (!req.query.id || isNaN(Number(req.query.id))) {
                return res.status(statusCode("NO_CONTENT")).send({ message: 'error', data: 'invalid id' });
            }

            const { message, data } = this.profileService.getProfileById(Number(req.query.id));
            if (message === 'error') {
                return res.status(204).send({ message, data });
            }
            //print(`[PROFILE] User profile fetched for ID: ${data}`);
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
        const controlFolderAvatar = data.avatar_url.startsWith("/images/")
        if (controlFolderAvatar)
            data.avatar_url = `data.avatar_url`;
        const profileData = {
            id: data.id,
            username: data.username,
            avatar: data.avatar_url,
        };
        return { message: 'success', data: profileData };
    }
}

export { ProfileControler }