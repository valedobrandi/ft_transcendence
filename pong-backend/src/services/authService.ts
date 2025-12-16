import { UsersModel } from "../models/usersModel.js";
import db from "../database/db.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

class AuthService {
    private usersModelInstance = new UsersModel(db)

    static generate2FACode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendQrCode(id: number): Promise<{ message: any, data: any }> {
        const secret = speakeasy.generateSecret({ length: 20 });
        if (secret === undefined || secret.otpauth_url === undefined)
            return {message: 'error', data: ''};
        const qr = await QRCode.toDataURL(secret.otpauth_url);

        this.usersModelInstance.saveAuthToken(id, secret.base32);
        return {message: 'success', data: { qrCode: qr }};
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
