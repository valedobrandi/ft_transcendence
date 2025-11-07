import bcrypt from "bcrypt";
import fastify from "fastify";
import db from "../../database/db";
import { UsersModel } from "../models/usersModel";
import { AuthService } from "./authService";
import { authenticationRoomInstance } from "../state/authenticationRoom";


class LoginService {
	private userModelInstance = new UsersModel(db);
	private authService = new AuthService();

	async login(username: string, password: string) {
		const { status, data } = this.userModelInstance.findUserByEmailOrUsername(username);

		if (status === 'error') {
			return { status, data };
		}

		const validatePassword = await bcrypt.compare(password, data.password);
		if (!validatePassword) {
			return { status, data };
		}

		if (data.twoFactorEnabled) {
			const code = this.authService.generate2FACode();
			const authRoom = authenticationRoomInstance;
			authRoom.add(data.username, code);
			await this.authService.send2FAEmail(data.email, code);
			return { status: 'success', data: { message: '2FA code sent to email' } };
		}

		const accessToken = this.authService.setAccessToken({ id: data.id, email: data.email, username: data.username });

		return { status: 'success', data: { accessToken } };
	}
}

export { LoginService };