import { navigateTo } from "../utils";
import { Button } from "./Button";

export function Login(): HTMLElement {
	const viewDiv = document.createElement("div");
    viewDiv.id = "view-container";
	viewDiv.className = "flex flex-col items-center h-screen";

	const mainDiv = document.createElement("div");
    mainDiv.id = "login-container";
    mainDiv.className = "flex flex-col gap-2 justify-center items-center mt-[100px]";

    const title = document.createElement("h1");
    title.className = "game-font text-6xl text-center mb-10 text-yellow-400 text-shadow-lg/30 pt-20";
    title.textContent = "Ft_transcendence Ping-Pong";
    viewDiv.appendChild(title);

	const guestBtn = Button("guest", "h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/guest"));
   
    const singInBtn = Button("login", "h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/sing-in"));
    singInBtn.setAttribute("disabled", "true");
    singInBtn.className += " opacity-20 cursor-not-allowed";
    singInBtn.className = singInBtn.className.replace("cursor-pointer", "cursor-not-allowed");

	const registerBtn = Button("sing in", "h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/register"));
    registerBtn.setAttribute("disabled", "true");
    registerBtn.className += " opacity-20";
    // filter out cursor-pointer from the class
    registerBtn.className = registerBtn.className.replace("cursor-pointer", "cursor-not-allowed");
	mainDiv.appendChild(guestBtn);
	mainDiv.appendChild(singInBtn);
    mainDiv.appendChild(registerBtn);
	viewDiv.appendChild(mainDiv);
	return viewDiv;
}