import { Resend } from "resend";
import bcrypt from 'bcrypt';
import { connectedRoomInstance } from "../state/connectedRoom.js";
import db from "../../database/db.js";
import { UsersModel } from "../models/usersModel.js";
import { userModelReturn } from "../types/RouteGuest.js";
import { fastify } from "../server.js";
import { FastifyReply } from 'fastify';


const RESEND_API_KEY = process.env.RESEND_API_KEY;

export type loginResponse =
	| { status: 'success', data: { accessToken: string, user: { id: number, email: string, username: string, twoFactorEnabled: boolean } } }
	| { status: 'error', data: { message: string } };

class AuthService {

	private resend = new Resend(RESEND_API_KEY || "123");
	private usersModelInstance = new UsersModel(db);

	setRefreshToken(payload: { id: number; email: string; username: string }, res: FastifyReply): void {
		const refreshToken = fastify.jwt.sign(payload, { expiresIn: '7d' });
		res.setCookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: '/refresh-token'
		});
	}

	setAccessToken(payload: { id: number; email: string; username: string }): string {
		const accessToken = fastify.jwt.sign(payload, { expiresIn: '30m' });
		return accessToken;
	}

	generate2FACode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	async login(username: string, password: string): Promise<loginResponse> {
		const user = this.usersModelInstance.findUserByEmailOrUsername(username);
		const passwordMatches = await bcrypt.compare(password, user.password);
		if (!user || !passwordMatches) {
			return { status: 'error', data: { message: 'invalid credentials' } };
		}
		const accessToken = fastify.jwt.sign({ id: user.id, email: user.email, username: user.username });
		return { status: 'success', data: { accessToken } };
	}

	send2FAEmail(destination: string, code: string) {
		return this.sendEmail(
			destination,
			"Your 2FA code",
			`<p>Your 2FA code is: <strong>${code}</strong></p>`
		);
	}

	async sendEmail(destination: string, subject: string, html: string) {
		const { data, error } = await this.resend.emails.send({
			from: "onboarding@resend.dev",
			to: destination,
			subject: subject,
			html: html
		});
	}

	guestLoginValidation(username: string): userModelReturn {
		const saveAtDatabase: userModelReturn = this.usersModelInstance.saveGuestUsername(username);
		if ('error' in saveAtDatabase) {
			return { error: saveAtDatabase.error };
		}
		connectedRoomInstance.addUser(saveAtDatabase.username, Number(saveAtDatabase.id));
		return { message: saveAtDatabase.message, username: saveAtDatabase.username, id: saveAtDatabase.id };
	}
}

export { AuthService };