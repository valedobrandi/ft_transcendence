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
            connectedRoomInstance.joinRoom(username, id);
            return res.status(200).send({
                message: 'connected', payload: { username }
            });
        }
        return res.status(400).send({ error: 'invalid_2fa_code' });
    }

    async isAuthenticated(req: FastifyRequest, res: FastifyReply): Promise<FastifyReply> {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).send({ message: 'error', data: 'token_not_provided' });
            }

            const token = await req.jwtVerify() as { id: number };
            const {message, data} = this.authServiceInstance.verifyToken(token.id);
            
            if (message === 'success') {
                connectedRoomInstance.joinRoom(data.username, data.id);
                return res.status(200).send({ message: 'success', data: data });
            } 
            
            return res.status(401).send({ message: 'error', data: 'invalid_token' });
            
        } catch (error: any) {
            return res.status(error.statusCode || 500).send({ message: 'error', data: error });
        }
    }
}

export { AuthController };