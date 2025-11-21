import { FastifyRequest, FastifyReply } from 'fastify';
import { getIdUser, updatedUserInDB } from '../user_service/user_service.js';
import bcrypt from 'bcrypt';
import {UpdateBody} from '../types/ProfilType.js';
import { UsersModel } from '../models/usersModel.js';
import db from '../../database/db.js'

class ProfileControler {

    private usersModel = new UsersModel(db);
    async updateUser(req: FastifyRequest<{ Body: UpdateBody }>, res: FastifyReply) {
    try{

        const player = getIdUser(Number(req.userId));
        if (!player)
            return res.status(404).send({ error: 'user not found' });

		if (req.body.username) {
			const checkUsernameAlready = this.usersModel.findUserByUsername(req.body.username);
			if(checkUsernameAlready) {
                return res.status(408).send({ error: 'user already use' })
			}
		}

		if (req.body.email) {
			const checkEmailAlready = this.usersModel.findUserByEmail(req.body.email);
			if(checkEmailAlready) {
					return res.status(407).send({ error: 'Email already use' })
			}
		}

        if (req.body.email !== undefined) {
            player.email = req.body.email;
		}

        if (req.body.username !== undefined) {
            player.username = req.body.username;
		}

        if (req.body.password) {
            if (!req.body.current_password)
                return res.status(422).send({ error: 'current_password required to change password' });
            const ok = await bcrypt.compare(req.body.current_password, player.password);
            if (!ok)
                return res.status(401).send({ error: 'invalid current password' });
            player.password = await bcrypt.hash(req.body.password, 10);
        }
            updatedUserInDB(player);
            return res.status(200).send({ message: 'success', payload: {username: req.body.username, email: req.body.email}});
        }
        catch (error) {
            req.log.error(error);
            return res.status(500).send({ error: 'Internal server error' });
        }
    }
}

export { ProfileControler }