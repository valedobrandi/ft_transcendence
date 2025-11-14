import { FastifyRequest, FastifyReply } from 'fastify';
import { getIdUser, updatedUserInDB } from '../user_service/user_service';
import { RegisterBody } from '../types/RegisterType';
import bcrypt from 'bcrypt';
import {UpdateBody} from '../types/ProfilType';
import { UsersModel } from '../models/usersModel.js';
import db from '../../database/db.js'
import { print } from '../server';

class ProfileControler {

    getProfile() {
        
    }

    async updateUser(req: FastifyRequest<{ Params: { id: number }, Body: UpdateBody }>, res: FastifyReply) {
    const usersModel = new UsersModel(db);
    try{
        const { email, username, password } = req.body;
        const { id } = req.user as {id: number};

        const player = getIdUser(id);
        if (!player)
            return res.status(404).send({ error: 'user not found' });
        
        print(`DANS SERVEUR  ==== ${username}`);
        const checkUsernameAlready = usersModel.findUserByUsername(username);
        if(checkUsernameAlready)
                return res.status(408).send({ error: 'user already use' })
        const checkEmailAlready = usersModel.findUserByEmail(username);
        if(checkEmailAlready)
                return res.status(407).send({ error: 'Email already use' })
        
        if (email !== undefined)
            player.email = email;
        if (username !== undefined)
            player.username = username;

        if (password)
        {
            if (!req.body.current_password) 
                return res.status(422).send({ error: 'current_password required to change password' });
            const ok = await bcrypt.compare(req.body.current_password, player.password);
            if (!ok) 
                return res.status(401).send({ error: 'invalid current password' });
            player.password = await bcrypt.hash(password, 10);
        }
            await updatedUserInDB(player);
            return res.status(200).send({ message: 'success', payload: {username, email}});
        }
        catch (error) {
            req.log.error(error);
            return res.status(500).send({ error: 'Internal server error' });
        }
    }

    
}

export { ProfileControler }