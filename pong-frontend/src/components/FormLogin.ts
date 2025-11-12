import { FancyButton } from "./Button";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";
import { fetchRequest, navigateTo } from "../utils";
import { id, jwt } from "../app";
import { CreateAlert } from "./CreateAlert";

export function FormLogin(): HTMLElement {
	const viewDiv = document.createElement("div");
	viewDiv.className = "flex items-center justify-center h-screen";
	viewDiv.style.backgroundImage = "url('../../default/default_background.jpg')";
	viewDiv.style.backgroundSize = "cover";

    const card = document.createElement("div");
    card.className = "flex flex-col items-center bg-gray-950 border-4 border-gray-700 rounded-2xl shadow-lg px-20 py-12 w-[520px]";

    const title = document.createElement("h1");
    title.className = "game-font text-5xl text-[hsl(345,100%,47%)] text-shadow-lg/30 mb-8 text-center";
    title.textContent = "WELCOME BACK";

    const formElement = document.createElement("form");
    formElement.className = "flex flex-col justify-center items-center flex-grow gap-8";

    formElement.onsubmit = (event) => {
        event.preventDefault();
        console.log("2FA code submitted");
    };

	const inputPasswordUI = InputPassword();
	const inputNameUI = InputName();

    const sendBtn = FancyButton("login", "scale-100 h-14 w-60 game-font tracking-widest text-lg", () => {});

	formElement.appendChild(inputNameUI);
	formElement.appendChild(inputPasswordUI);
    formElement.appendChild(sendBtn);

    formElement.onsubmit = async (e) => 
    {
        e.preventDefault();

        const username_input = document.getElementById('register_username') as HTMLInputElement;
        const password_input = document.getElementById('register_password') as HTMLInputElement;
        if (username_input === null || password_input === null) return;

        const username = username_input.value.trim();
        const password = password_input.value.trim();

        const response = await fetchRequest(
            `/login`,
            'POST',
            {},
            { body: JSON.stringify({ username, password}) }
        );

        if (response.message === 'success') {
            jwt.token = response.payload.token;
            id.username = response.payload.username;
            console.log(jwt.token);
            navigateTo("/intra");
        }
        else if (response.status === 'error') {
            const existingAlert = document.getElementById("alert-popup");
            if (existingAlert)
                existingAlert.remove();
            document.getElementById('root')?.prepend(CreateAlert(response.message));
        }
    };

    card.appendChild(title);
    card.appendChild(formElement);
    viewDiv.appendChild(card);

    return viewDiv;
}
