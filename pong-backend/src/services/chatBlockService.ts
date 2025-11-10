import db from "../../database/db.js";
import { ChatBlockModel } from "../models/chatBlockModel.js";
import { print } from "../server.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";

class ChatBlockService {
    private chatBlockInstance = new ChatBlockModel(db);

    addUserToBlockList(userId: number, blockedUserId: number) {
        const { status, data } = this.chatBlockInstance.addUserToBlockList(userId, blockedUserId);
        if (status === "success") {
            const user = connectedRoomInstance.getById(blockedUserId);
            if (user !== undefined) {
                user.chat.addToBlockedUsers([userId]);
            }
        }
        return { status, data };
    }

    deleteUserFromBlockList(userId: number, blockedUserId: number){
        const { status, data } = this.chatBlockInstance.deleteUserFromBlockList(userId, blockedUserId);
        if (status === "success") {
            const user = connectedRoomInstance.getById(userId);
            if (user !== undefined) {
                user.chat.removeFromBlockedUsers(blockedUserId);
            }
        }
        return { status, data };
    }

    getBlockedUsers(userId: number){
        const { status, data } = this.chatBlockInstance.getBlockedUsers(userId);
        if (status === "success") {
            const blockedIds = data.map(entry => Number(entry.blocked_user_id));
            return { status, data: blockedIds };
        }
        return { status, data };
    }
}

export { ChatBlockService };