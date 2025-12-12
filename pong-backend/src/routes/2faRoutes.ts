import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import db from '../database/db.js';
import { authenticationRoomInstance } from "../state/authenticationRoom.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { getIdUser, updatedUserInDB } from '../user_service/user_service.js';
import { UserReturnDB } from '../models/usersModel.js';


export default async function twoFARoutes(fastify: FastifyInstance) {

fastify.put(
    "/updata/2FA",
    { preHandler: [fastify.authenticate] },
    async (
        req: FastifyRequest<{ Body: { twoFA_enabled: 0 | 1 } }>,
        reply: FastifyReply
    ) => {
        try {
            const { twoFA_enabled } = req.body;
            const userId = req.userId;

            if (twoFA_enabled !== 0 && twoFA_enabled !== 1) {
                return reply.status(400).send({ error: "Invalid 2FA value (must be 0 or 1)" });
            }

            const existingUser = getIdUser(userId);
            if (!existingUser) {
                return reply.status(400).send({ error: "User not found" });
            }

            db.prepare("UPDATE users SET twoFA_enabled = ? WHERE id = ?")
              .run(twoFA_enabled, userId);

            return reply.send({
                message: "success",
                payload: { twoFA_enabled }
            });

        } catch (e) {
            return reply.status(500).send({ message: "error", error: e });
        }
    }
);

    fastify.post('/2fa/verify', async (req: FastifyRequest<{ Body: { username: string, code: string }}>, res: FastifyReply) => {
        const { username, code } = req.body;

        if (!username || !code)
            return res.status(400).send({ message: "missing_fields" });

        const userCode = authenticationRoomInstance.getCode(username);

        if (!userCode)
            return res.status(400).send({ message: "code_expired" });

        if (userCode !== code)
            return res.status(401).send({ message: "invalid_code" });

        // Code valid → remove it so it can't be reused
        authenticationRoomInstance.delete(username);


        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as UserReturnDB | undefined;
		if (!user) {
			return res.status(404).send({ message: "user_not_found" });
		}

        const payload = { id: user.id };
        const accessToken = fastify.jwt.sign(payload, { expiresIn: "10h" });

    const clientIsConnected = connectedRoomInstance.has(Number(user.id));

        if (clientIsConnected) {
            connectedRoomInstance.disconnect(Number(user.id));
        }

        connectedRoomInstance.addUser(user.username, user.id);

        return res.send({
            message: "success",
            payload: { accessToken, ...payload, username }
        });
    });
}
