import { navigateTo } from "../utils";
import { guestView, registerView, singInView } from "../views";
import { Button } from "./Button";

export function Login(): HTMLElement {
	const viewDiv = document.createElement("div");
	viewDiv.className = "flex flex-col items-center h-screen mt-20";

	const mainDiv = document.createElement("div");
    mainDiv.id = "login-container";
    mainDiv.className = "flex flex-col gap-2 justify-center items-center mt-[100px]";

    const title = document.createElement("h1");
    title.className = "game-font text-6xl text-center mb-10 text-yellow-400 text-shadow-lg/30";
    title.textContent = "Ft_transcendence Ping-Pong";
    viewDiv.appendChild(title);

	const guestBtn = Button("guest", "h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/guest", guestView));
    const singInBtn = Button("login", "h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/sing-in", singInView));
	const registerBtn = Button("sing in", "h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/register", registerView));

	mainDiv.appendChild(guestBtn);
	mainDiv.appendChild(singInBtn);
    mainDiv.appendChild(registerBtn);
	viewDiv.appendChild(mainDiv);
	return viewDiv;
}