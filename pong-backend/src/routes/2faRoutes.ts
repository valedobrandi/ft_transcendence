import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import db from '../database/db.js';
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { getIdUser } from '../user_service/user_service.js';
import {  UsersModel } from '../models/usersModel.js';
import speakeasy from "speakeasy";
import { AuthService } from '../services/authService.js';


export default async function twoFARoutes(fastify: FastifyInstance) {
    const userDatabase = new UsersModel(db);
    fastify.put(
        "/twoFA",
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

                db.prepare("UPDATE users SET twoFA_enabled = ? WHERE id = ?").run(twoFA_enabled, userId);

                let qrCode = "";
                if (twoFA_enabled === 1) {
                    const authService = new AuthService();
                    const { message, data } = await authService.sendQrCode(userId);
                    qrCode = data.qrCode;
                }
                
                return reply.send({
                    message: "success",
                    payload: { twoFA_enabled, qrCode }
                });

            } catch (e) {
                return reply.status(500).send({ message: "error", error: e });
            }
        }
    );

    fastify.post('/twoFA', async (req: FastifyRequest<{ Body: { id: number, code: string } }>, res: FastifyReply) => {
        const { id, code } = req.body;

        if (!id || !code)
            return res.status(400).send({ message: "missing_fields" });


        // Validate the code
        const base32Secret = userDatabase.getAuthToken(id);
        if (!base32Secret) {
            return res.status(400).send({ message: "error", data: "twoFA_not_enabled" });
        }

        const tokenValidates = speakeasy.totp.verify({
            secret: base32Secret,
            encoding: 'base32',
            token: code,
            window: 1 // Allow a 1-step window (30 seconds before or after)
        });

        if (!tokenValidates) {
            return res.status(401).send({ message: "invalid_code" });
        }

        const userResult = userDatabase.getProfileById(id);
        if (userResult.message === 'error') {
            return res.status(400).send({ message: "error", data: "user_not_found" });
        }

        const user = userResult.data;
        const username = user.username;
        //const userCode = authenticationRoomInstance.getCode(username);

        // if (!userCode)
        //     return res.status(400).send({ message: "code_expired" });

        // if (userCode !== code)
        //     return res.status(401).send({ message: "invalid_code" });

        // // Code valid → remove it so it can't be reused
        // authenticationRoomInstance.delete(username);


        const payload = { id: user.id };
        const accessToken = fastify.jwt.sign(payload, { expiresIn: "10h" });

        connectedRoomInstance.joinRoom(user.username, user.id);

        return res.send({
            message: "success",
            payload: { accessToken, ...payload, username }
        });
    });
}
