import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';
import { GuestPostDTO } from '../types/GuestRoute.js';

class AuthController {

    async veryify2FA(req: FastifyRequest, res: FastifyReply): Promise<FastifyReply> {
        const { user, code } = req.body as { user: string, code: string };

        const isValid = authenticationRoomInstance.verify(user.toString(), code);
        if (isValid === true) {
            return res.status(200).send({
                message: 'connection sucessfull', payload: { code: code }
            });
        }
        return res.status(400).send({ error: 'Invalid 2FA code' });
    }

    async guestLogin(req: FastifyRequest<{Body: GuestPostDTO}>, res: FastifyReply): Promise<FastifyReply> {
        
        const { username } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).send({ error: 'Username is required' });
        }

        return res.status(200).send({
            message: 'connection sucessfull', payload: { code: undefined }
        });
    }
}

export { AuthController };