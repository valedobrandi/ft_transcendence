import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';

class AuthController {
    async veryify2FA(req: FastifyRequest, res: FastifyReply): Promise<FastifyReply> {
        const { user, code } = req.body as { user: string, code: string };

        const isValid = authenticationRoomInstance.verify(user.toString(), code);
        if (isValid === true) {
            return res.status(200).send({
                message: '2FA verified successfully', payload: { code: code }
            });
        }
        return res.status(400).send({ error: 'Invalid 2FA code' });
    }
}

export { AuthController };