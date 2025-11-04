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
import { endpoint } from "./endPoints";
import { initSocket } from "./websocket";
import { id } from "./app";

export function intraView(root: HTMLElement) {
	initSocket(endpoint.pong_backend_websocket, id.username);
	websocketConnect();
	root.innerHTML = "";
	const intraUI = Intra();
	const menuUI = Menu();
	root.appendChild(menuUI);
	root.appendChild(intraUI);
	changeChatHeader(messagerState.selectChat.name);
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
    const enterBtn =  document.getElementById("enter-button") as HTMLButtonElement;
    if (id.username !== "") {
        enterBtn.setAttribute("disabled", "true");
        enterBtn.className += " opacity-20 cursor-not-allowed";
        enterBtn.className = enterBtn.className.replace("cursor-pointer", "cursor-not-allowed");
    }
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