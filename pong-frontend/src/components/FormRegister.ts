import { FancyButton, ReturnButton } from "./Button";
import DOMPurify from "dompurify";
import { InputEmail } from "./InputEmail";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";
import { fetchRequest, navigateTo } from "../utils";
import { CreateAlert } from "./CreateAlert";
import { profile } from "../app";

export function Register(): HTMLElement {
	const viewDiv = document.createElement("div");
	viewDiv.className = "flex items-center justify-center h-screen";
	viewDiv.style.backgroundImage = "url('/default_background.jpg')";
	viewDiv.style.backgroundSize = "cover";

	const backBtn = ReturnButton("/");
	viewDiv.appendChild(backBtn);

	// Create a card to store Form
	const card = document.createElement("div");
	card.className = "flex flex-col items-center bg-gray-950 border-4 border-gray-700 rounded-2xl shadow-lg px-20 py-12 w-[520px]";

	// Create a form to store Title + Inputs + Button
	const formElement = document.createElement("form");
	formElement.className = "flex flex-col justify-center items-center flex-grow gap-20";

    formElement.onsubmit = (e) => {
        e.preventDefault();
        console.log("2FA code submitted");
    };

	// Add a title to the form
	const title = document.createElement("h1");
	title.className = "game-font text-5xl text-[hsl(345,100%,47%)] text-shadow-lg/30 mb-8 text-center";
	title.textContent = "WELCOME";
	formElement.appendChild(title);

	// Add inputs Name + Email + Password to the form
	const inputContainer = document.createElement("div");
	inputContainer.className = "flex flex-col gap-10 w-full";

	const inputNameUI = InputName();
	inputContainer.appendChild(inputNameUI);
	const inputEmailUI = InputEmail();
	inputContainer.appendChild(inputEmailUI);
	const inputPasswordUI = InputPassword();
	inputContainer.appendChild(inputPasswordUI);

	formElement.appendChild(inputContainer);

	// Add button to the form
    const registerButton = FancyButton("register", "scale-100 h-14 w-60 game-font tracking-widest text-lg", () => {});
	formElement.appendChild(registerButton);

	// Check inputs information
	formElement.onsubmit = async (e) => {
		e.preventDefault();

		const username_input = document.getElementById('register_username') as HTMLInputElement;
		const email_input = document.getElementById('register_email') as HTMLInputElement;
		const password_input = document.getElementById('register_password') as HTMLInputElement;
		if (username_input === null || email_input === null || password_input === null) return;
		
		// Sanitize inputs
		const username = DOMPurify.sanitize(username_input.value.trim());
		const email = DOMPurify.sanitize(email_input.value.trim());
		const password = DOMPurify.sanitize(password_input.value.trim());

		
		if (username.length > 15) {
			alert("username too long");
			return;
		}
		// Check for bad characters in username
		const badChars = /[ !@#$%^&*()+={}[\]|\\;:'"<>,?/~`]/;
		if (badChars.test(username)){
			alert("username contains invalid characters");
			return;
		}

		// Sanitize Websocket bad characters
		username.replace(/[^a-zA-Z0-9._-]/g, '');

		if (password.length > 15) {
			alert("password too long");
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
			alert("Invalid email format");
			return;
		}

		const response = await fetchRequest(
			`/register`,'POST',{},
			{body: JSON.stringify({username, email, password})}
		);
		
		if (response.message === 'success') {
			profile.username = response.payload.username;
			profile.id = response.payload.id;
			navigateTo("/");
		}
		else if (response.status === 'error') {
			const existingAlert = document.getElementById("alert-popup");
			if (existingAlert)
				existingAlert.remove();
			document.getElementById('root')?.prepend(CreateAlert(response.message));
		}
	};

	card.appendChild(formElement);
	viewDiv.appendChild(card);

	return viewDiv;
}
