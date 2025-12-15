import { Resend } from "resend";
import { UsersModel } from "../models/usersModel.js";
import db from "../database/db.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

class AuthService {
    private usersModelInstance = new UsersModel(db)

    private resend = new Resend(RESEND_API_KEY || "123");

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

    verifyToken(id: number) {
        const user = this.usersModelInstance.getProfileById(Number(id));
        if (user.message === 'error') {
            return {message: 'error', data: 'invalid_token'};
        }
        return {message: 'success', data: user.data };
    }

}

export { AuthService };