import { profile, jwt } from "../app";
import { fetchRequest, navigateTo } from "../utils";
import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputName } from "./InputName";

export function FormGuest(): HTMLElement {
	const viewDiv = document.createElement("div");
	viewDiv.className = "flex flex-col items-center h-screen";

	const headerBar = HeaderBar("Guest Access");

	const formElement = document.createElement("form");
	formElement.className = "flex flex-col mt-[100px] flex-grow gap-2 maw-w-sm";

	const inputNameUI = InputName();
	const sendBtn = Button("enter", "h-14 game-font tracking-widest text-lg", () => { });

	viewDiv.appendChild(headerBar);
	viewDiv.appendChild(formElement);
	formElement.appendChild(inputNameUI);
	formElement.appendChild(sendBtn);

	formElement.onsubmit = async (e) => {
		e.preventDefault();

		const getInput = document.getElementById('guest-username') as HTMLInputElement;
		if (getInput === null) return;

		const username = getInput.value.trim();

		if (username.length < 3) {
			alert("nickname not valid.");
			return;
		}

		const response = await fetchRequest(
			`/login`,
			'POST',
			{},
			{ body: JSON.stringify({ username }) }
		);

		if (response.message === 'success') {
			profile.username = response.payload.username;
			profile.id = response.payload.id;
			navigateTo("/intra");
		}
	};

	return viewDiv;
}
