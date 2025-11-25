import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticationRoomInstance } from '../state/authenticationRoom.js';
import { GuestPostDTO } from '../types/RouteGuest.js';
import { AuthService } from '../services/authService.js';
import { connectedRoomInstance } from '../state/ConnectedRoom.js';

class AuthController {

    private authServiceInstance = new AuthService();

    async veryify2FA(req: FastifyRequest<{ Body: GuestPostDTO }>, res: FastifyReply): Promise<FastifyReply> {
        const { username, code, id } = req.body;
		
        const isValid = authenticationRoomInstance.verify(username.toString(), code);
        if (isValid === true) {
            authenticationRoomInstance.delete(username);
            connectedRoomInstance.addUser(username, id);
            return res.status(200).send({
                message: 'connected', payload: { username }
            });
        }
        return res.status(400).send({ error: 'Invalid 2FA code' });
    }

    guestLogin(req: FastifyRequest<{ Body: GuestPostDTO }>, res: FastifyReply) {

        // const { username } = req.body;
        // const response = this.authServiceInstance.guestLoginValidation(username);

        // if ('message' in response) {
        //     return res.status(200).send({
        //         message: response.message, payload: { username: response.username, id: response.id }
        //     });
        // }

        // return res.status(400).send({ error: response.error });
    }
}

export { AuthController };