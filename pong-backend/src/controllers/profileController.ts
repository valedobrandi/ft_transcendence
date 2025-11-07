import { FastifyRequest, FastifyReply } from 'fastify';
import { getIdUser, updatedUserInDB } from '../user_service/user_service';
import { RegisterBody } from '../types/RegisterType';
import bcrypt from 'bcrypt';

class ProfileControler {

    getProfile() {
        
    }

    async updateUser(req: FastifyRequest<{ Params: { id: number }, Body: RegisterBody }>, res: FastifyReply) {
        const { email, username, password } = req.body;
        const { id } = req.user as any;

        const player = getIdUser(id);
        if (!player)
            return res.status(404).send({ error: 'user not found' });

        player.email = email ?? player.email;
        player.username = username ?? player.username;

        if (password) {
            const hash = await bcrypt.hash(password, 10);
            player.password = hash;
        }

        try {
            updatedUserInDB(player);
            return res.status(200).send({ message: 'Profile updated successfully', user: player });
        }
        catch (error) {
            const err = error as Error;
        }
    }
    
}

export { ProfileControler }