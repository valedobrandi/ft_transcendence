import { Intra } from "./components/Intra";
import { Login } from "./components/Login";
import { Menu } from "./components/Menu";
import { RenderGame } from "./components/RenderGame";
import { Register } from "./components/FormRegister";
import { FormSingIn } from "./components/FormSingIn";
import { FormTwoFactorAuthentication } from "./components/FormTwoFactorAuthentication";
import { websocketConnect } from "./websocket/websocketConnect";
import { changeChatHeader, messagerState } from "./states/messagerState";
import { FormGuest } from "./components/FormGuest";
import { endpoint } from "./endpoint";
import { initSocket } from "./websocket";
import { id } from "./app";

export function intraView(root: HTMLElement) {
	initSocket(endpoint.backend, id.username);
	root.innerHTML = "";
	const intraUI = Intra();
	const menuUI = Menu();
	root.appendChild(menuUI);
	root.appendChild(intraUI);
	websocketConnect();
	changeChatHeader(messagerState.selectChat);

}

export function matchView(root: HTMLElement) {
	root.innerHTML = "";

	const container = document.createElement("div");
	container.className = "flex justify-center items-center h-full w-full overflow-hidden"
	const pongUI = RenderGame();
	container.appendChild(pongUI);
	root.appendChild(container);
}

export function loginView(root: HTMLElement) {
	root.innerHTML = "";
	const loginUI = Login();
	root.appendChild(loginUI);
}

export function guestView(root: HTMLElement) {
    root.innerHTML = "";
    const guestUI = FormGuest();
    root.appendChild(guestUI);
}

export function singInView(root: HTMLElement) {
	root.innerHTML = "";
	const SingUI = FormSingIn();
	root.appendChild(SingUI);
}

export function registerView(root: HTMLElement) {
	root.innerHTML = "";
	const registerUI = Register();
	root.appendChild(registerUI);
}

export function twoFactorAuthenticationView(root: HTMLElement) {
	root.innerHTML = "";
	const authenticationUI = FormTwoFactorAuthentication();
	root.appendChild(authenticationUI);
}