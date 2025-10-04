import { Intra } from "./components/Intra";
import { Login } from "./components/Login";
import { Menu } from "./components/Menu";
import { Pong } from "./components/Pong";
import { Register } from "./components/FormRegister";
import { FormSingIn } from "./components/FormSingIn";
import { FormTwoFactorAuthentication } from "./components/FormTwoFactorAuthentication";

export function intraView(root: HTMLElement) {
    root.innerHTML = "";
    const intraUI = Intra();
    const menuUI = Menu();
    root.appendChild(menuUI);
    root.appendChild(intraUI);
}

export function matchView(root: HTMLElement) {
    root.innerHTML = "";
    const pongUI = Pong();
    root.appendChild(pongUI);
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