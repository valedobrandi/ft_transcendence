import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';
import { GuestPostDTO } from '../types/GuestRoute.js';
import { AuthService } from '../services/authService.js';
import { connectedRoomInstance } from '../state/connectedRoom.js';

class AuthController {

    private authServiceInstance = new AuthService();
    async veryify2FA(req: FastifyRequest<{ Body: GuestPostDTO }>, res: FastifyReply): Promise<FastifyReply> {
        const { username, code } = req.body;

        const isValid = authenticationRoomInstance.verify(username.toString(), code);
        if (isValid === true) {
            authenticationRoomInstance.delete(username);
            connectedRoomInstance.addUser(username);
            return res.status(200).send({
                message: 'connected', payload: { username }
            });
        }
        return res.status(400).send({ error: 'Invalid 2FA code' });
    }

    async guestLogin(req: FastifyRequest<{ Body: GuestPostDTO }>, res: FastifyReply): Promise<FastifyReply> {

        const { username } = req.body;
        const validation = await this.authServiceInstance.guestLoginValidation(username);

        if (validation.valid === true) {
            return res.status(200).send({
                message: 'connected', payload: { username }
            });
        }

        return res.status(400).send({ error: validation.error });
    }
}

export { AuthController };