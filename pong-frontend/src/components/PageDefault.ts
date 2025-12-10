import { navigateTo } from "../utils";
import { FancyButton } from "./Button";

export function Default(): HTMLElement {
	const viewDiv = document.createElement("div");
    viewDiv.id = "view-container";
	viewDiv.className = "flex flex-col items-center h-screen";
	viewDiv.style.backgroundImage = "url('/default_background.jpg')";
	viewDiv.style.backgroundSize = "cover";

	const mainDiv = document.createElement("div");
    mainDiv.id = "login-container";
    mainDiv.className = "flex flex-col gap-20 justify-center items-center mt-[200px]";

    const title = document.createElement("h1");
    title.className = "game-font text-6xl text-center mb-10 text-[hsl(345,100%,47%)] text-shadow-lg/30 pt-20";
    title.textContent = "Ft_transcendence Ping-Pong";
    viewDiv.appendChild(title);

	//const guestBtn = FancyButton("guest", "scale-150 h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/guest"));

    const loginBtn = FancyButton("login", "scale-150 h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/login"));

	const registerBtn = FancyButton("register", "scale-150 h-14 w-60 game-font tracking-widest text-lg", () => navigateTo("/register"));

	//mainDiv.appendChild(guestBtn);
	mainDiv.appendChild(loginBtn);
    mainDiv.appendChild(registerBtn);
	viewDiv.appendChild(mainDiv);
	return viewDiv;
}
