import db from "../../database/db.js";
import { ChatBlockModel } from "../models/chatBlockModel.js";

class ChatBlockService {
    private chatBlockInstance = new ChatBlockModel(db);

    addUserToBlockList(userId: number, blockedUserId: number): void {
        this.chatBlockInstance.addUserToBlockList(userId, blockedUserId);
    }

    deleteUserFromBlockList(userId: number, blockedUserId: number): void {
        this.chatBlockInstance.deleteUserFromBlockList(userId, blockedUserId);
    }

    async getBlockedUsers(userId: number): Promise<number[]> {
        const response = this.chatBlockInstance.getBlockedUsers(userId);
        return response.map((item) => item.blocked_user_id);
    }
}

export { ChatBlockService };