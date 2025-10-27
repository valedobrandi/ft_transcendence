import { Intra } from "./components/Intra";
import { Login } from "./components/Login";
import { Menu } from "./components/Menu";
import { RenderGame } from "./components/RenderGame";
import { Register } from "./components/FormRegister";
import { FormSingIn } from "./components/FormSingIn";
import { FormTwoFactorAuthentication } from "./components/FormTwoFactorAuthentication";
import { websocketConnect } from "./websocket/websocketConnect";
import { changeChatHeader, messagerState } from "./states/messagerState";

export function intraView(root: HTMLElement) {
	root.innerHTML = "";
	const intraUI = Intra();
	const menuUI = Menu();
	root.appendChild(menuUI);
	root.appendChild(intraUI);
	websocketConnect();
	changeChatHeader(messagerState.selectChat);
	// In not one is clicked, default to intra

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