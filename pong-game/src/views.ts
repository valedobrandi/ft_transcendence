import { intra } from "./components/intra";
import { Login } from "./components/Login";
import { menu } from "./components/menu";
import { pong } from "./components/pong";
import { Register } from "./components/Register";
import { settings } from "./components/settings";
import { SingIn } from "./components/SingIn";
import { TwoFactorAuthentication } from "./components/TwoFactorAuthentication";

export function IntraView(root: HTMLElement) {
    root.innerHTML = "";
    const intraUI = intra();
    const menuUI = menu();
    root.appendChild(menuUI);
    root.appendChild(intraUI);
}

export function MatchView(root: HTMLElement) {
    root.innerHTML = "";
    const pongUI = pong();
    root.appendChild(pongUI);
}

export function LoginView(root: HTMLElement) {
    root.innerHTML = "";
	const loginUI = Login();
	root.appendChild(loginUI);
}

export function SingInView(root: HTMLElement) {
    root.innerHTML = "";
	const SingUI = SingIn();
	root.appendChild(SingUI);
}

export function RegisterView(root: HTMLElement) {
    root.innerHTML = "";
	const registerUI = Register();
	root.appendChild(registerUI);
}

export function twoFactorAuthenticationView(root: HTMLElement) {
    root.innerHTML = "";
	const authenticationUI = TwoFactorAuthentication();
	root.appendChild(authenticationUI);
}