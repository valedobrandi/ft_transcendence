import { navigateTo } from "../utils";
import { RegisterView, SingInView } from "../views";
import { Button } from "./Button";

export function Login(): HTMLElement {
	const viewDiv = document.createElement("div");
	viewDiv.className = "flex justify-center items-center h-screen";

	const mainDiv = document.createElement("div");
    mainDiv.id = "login-container";
    mainDiv.className = "flex gap-2";

	const singInBtn = Button("Sign in", "", () => navigateTo("/sing-in", SingInView));
	const registerBtn = Button("Register", "", () => navigateTo("/register", RegisterView));

	mainDiv.appendChild(registerBtn);
	mainDiv.appendChild(singInBtn);
	viewDiv.appendChild(mainDiv);
	return viewDiv;
}