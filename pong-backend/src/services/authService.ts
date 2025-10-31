import { Resend } from "resend";
import { connectedRoomInstance } from "../state/connectedRoom.js";
import db from "../../database/db.js";
import { UsersModel } from "../models/usersModel.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

class AuthService {

    private resend = new Resend(RESEND_API_KEY || "123");
    private usersModelInstance = new UsersModel(db);

    static generate2FACode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendEmail(destination: string, subject: string, html: string): Promise<{data: any, error: any}> {
       const { data, error } = await this.resend.emails.send({
        from: "onboarding@resend.dev",
        to: destination,
        subject: subject,
        html: html
       });
       return {data, error};
    }

    async guestLoginValidation(username: string): Promise<{ valid: boolean; error?: string }> {
        const findUserAtDatabase = this.usersModelInstance.findUserByEmailOrUsername('', username);

        if (findUserAtDatabase !== undefined) {
            return { valid: false, error: 'username in use' };
        }

        const findAtConnectedRoom = connectedRoomInstance.getById(username);
        if (findAtConnectedRoom !== undefined) {
            return { valid: false, error: 'username in use' };
        }
		connectedRoomInstance.addUser(username);
        return { valid: true };
    }

}

export { AuthService };