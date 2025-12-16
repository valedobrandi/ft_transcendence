import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import { UsersModel } from "../models/usersModel.js";
import db from "../database/db.js";
import { statusCode } from "../types/statusCode.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { PlayerType } from "../types/PlayerType.js";
import { MessagesModel } from "../models/messagesModel.js";
import ChatManager from "../classes/ChatManager.js";

export function serverRoute(fastify: FastifyInstance) {
    const serverControllerInstance = new ServerController();
    fastify.get("/server/register", {
        preHandler: fastify.authenticate,
        handler: serverControllerInstance.getRegisterUsers.bind(serverControllerInstance)

    })

    fastify.post("/server/markedRead", {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: "object",
                properties: {
                    messageId: { type: "number" }
                },
                required: ["messageId"]
            }
        },
        handler: serverControllerInstance.markMessageAsRead.bind(serverControllerInstance)
    })

    fastify.get("/server/state", {
        preHandler: fastify.authenticate,
        handler: serverControllerInstance.getState.bind(serverControllerInstance)

    })

    fastify.post("/server/state", {
        preHandler: fastify.authenticate,
        schema: {
            body: {
                type: "object",
                properties: {
                    state: { type: "string" }
                },
                required: ["state"]
            }
        },
        handler: serverControllerInstance.saveUserState.bind(serverControllerInstance)
    })
}

class ServerController {
    private serverServiceInstance = new ServerService();

    getRegisterUsers(req: FastifyRequest, res: FastifyReply) {
        const { message, data } = this.serverServiceInstance.getRegisterUsers();
        return res.code(statusCode("OK")).send({ message, data });
    }

    getState(req: FastifyRequest, res: FastifyReply) {
        const { message, data } = this.serverServiceInstance.getState(req.userId);
        return res.code(statusCode("OK")).send({ message, data });
    }

    saveUserState(req: FastifyRequest<{ Body: { state: PlayerType["state"] } }>, res: FastifyReply) {
        const { message, data } = this.serverServiceInstance.saveUserState(req.userId, req.body.state);
        return res.code(statusCode("OK")).send({ message, data });
    }

    markMessageAsRead(req: FastifyRequest<{ Body: { messageId: number } }>, res: FastifyReply) {
        const messageId = req.body.messageId;
        this.serverServiceInstance.markMessageAsRead(messageId, req.userId);
        return res.code(statusCode("OK")).send({ message: "success", data: "message_marked_as_read" });
    }
}

class ServerService {
    private usersModelInstance: UsersModel;
    private messagesModelInstance: MessagesModel;

    constructor() {
        // Initialize models in the constructor to avoid circular-initialization
        // issues where imported bindings may not be ready at module-evaluation time.
        this.usersModelInstance = new UsersModel(db);
        this.messagesModelInstance = new MessagesModel(db);
    }

    getRegisterUsers() {
        const users = this.usersModelInstance.getAllUsers()
            .map((user) => ({
                id: user.id,
                name: user.username,
            }));
        return { message: "success", data: users };
    }

    getState(userId: number) {
        const connected = connectedRoomInstance.getById(userId);
        if (!connected) {
            return { message: "error", data: "disconnected" };
        }

        return { message: "success", data: connected.state };
    }

    saveUserState(userId: number, state: PlayerType["state"]) {
        const connected = connectedRoomInstance.getById(userId);
        if (!connected) {
            return { message: "error", data: "disconnected" };
        }
        connected.state = state;

        return { message: "success", data: "state_updated" };
    }

    markMessageAsRead(messageId: number, userId: number): void {
        this.messagesModelInstance.markMessageAsRead(messageId);
        // WEBSOCKET CHAT HISTORY UPDATE
        const chatManager = new ChatManager(userId, "");
        chatManager.sendHistory();
    }
}
