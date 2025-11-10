import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputEmail } from "./InputEmail";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";
import { fetchRequest, navigateTo } from "../utils";
import { id, jwt } from "../app";

export function Register(): HTMLElement {
	const viewDiv = document.createElement("div");
	viewDiv.className = "flex flex-col h-screen";

	const headerBar = HeaderBar("Register");

	const formElement = document.createElement("form");
	formElement.className = "flex flex-col justify-center items-center flex-grow gap-2 maw-w-sm mx-auto";

    formElement.onsubmit = (e) => {
        e.preventDefault();
        console.log("2FA code submitted");
    };

	const inputPasswordUI = InputPassword();
	const inputNameUI = InputName();
	const inputEmailUi = InputEmail();

    const sendBtn = Button("register", "w-full", () => {});
    
	viewDiv.appendChild(headerBar);
	viewDiv.appendChild(formElement);
    
	formElement.appendChild(inputNameUI);
	formElement.appendChild(inputEmailUi);
	formElement.appendChild(inputPasswordUI);
    formElement.appendChild(sendBtn);

	formElement.onsubmit = async (e) => {
		e.preventDefault();

		const username_input = document.getElementById('register_username') as HTMLInputElement;
		const email_input = document.getElementById('register_email') as HTMLInputElement;
		const password_input = document.getElementById('register_password') as HTMLInputElement;
		if (username_input === null || email_input === null || password_input === null) return;

		const username = username_input.value.trim();
		const email = email_input.value.trim();
		const password = password_input.value.trim();

		if (username.length < 3) {
			alert("username not valid.");
			return;
		}

		const response = await fetchRequest(
			`/register`,'POST',{},
			{ body: JSON.stringify({ username, email, password}) }
		);

		if (response.message === 'success') {
			id.username = response.payload.username;
			id.id = response.payload.id;
			navigateTo("/intra");
		}
	};
    
	return viewDiv;
}