import { Resend } from "resend";
import { UsersModel } from "../models/usersModel.js";
import db from "../database/db.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

class AuthService {

    private resend = new Resend(RESEND_API_KEY || "123");
    private usersModelInstance = new UsersModel(db);

    static generate2FACode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendEmail(destination: string, subject: string, html: string): Promise<{ data: any, error: any }> {
        const defaultReceiver = process.env.EMAIL_DEFAULT_RECEIVER || "";
        const { data, error } = await this.resend.emails.send({
            from: "onboarding@resend.dev",
            to: defaultReceiver,
            subject: subject,
            html: html
        });
        return { data, error };
    }

    guestLoginValidation(username: string) {
        // Look if the user is connected in the room
        // const connectedUser = connectedRoomInstance.getById(username);
        // if (connectedUser) {
        //     // Disconnect user first
        //     connectedRoomInstance.disconnect(username);
        // }

        // // Look for existing user
        // const existingUser = this.usersModelInstance.findUserByEmailOrUsername(username);
        // if (existingUser) {
        //     connectedRoomInstance.addUser(existingUser.username, Number(existingUser.id));
        //     return { message: 'success', username: existingUser.username, id: existingUser.id };
        // }

        // // Save guest user
        // const saveAtDatabase: SaveUser = this.usersModelInstance.saveGuestUsername(username);
        // if ('error' in saveAtDatabase) {
        //     return { error: saveAtDatabase.error };
        // }

        // connectedRoomInstance.addUser(saveAtDatabase.username, Number(saveAtDatabase.id));
        // return { message: saveAtDatabase.message, username: saveAtDatabase.username, id: saveAtDatabase.id };
    }
}

export { AuthService };