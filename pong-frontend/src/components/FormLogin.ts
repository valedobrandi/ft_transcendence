import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";
import { fetchRequest, navigateTo } from "../utils";
import { profile, jwt } from "../app";

export function FormLogin(): HTMLElement {
	const viewDiv = document.createElement("div");
    viewDiv.className = "flex flex-col h-screen";

    const headerBar = HeaderBar("LOGIN");

    const formElement = document.createElement("form");
    formElement.className = "flex flex-col justify-center items-center flex-grow gap-2 maw-w-sm mx-auto";

    formElement.onsubmit = (event) => {
        event.preventDefault();
        console.log("2FA code submitted");
    };

	const inputPasswordUI = InputPassword();
	const inputNameUI = InputName();

    const sendBtn = Button("login", "w-full", () => {});

	viewDiv.appendChild(headerBar);
    viewDiv.appendChild(formElement);
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
            { username, password}
        );

        if (response.message === 'success') {
            jwt.token = response.payload.accessToken;
            profile.username = response.payload.username;
			profile.url_avatar = response.payload.existingUser.avatar_url
			//profile.url_avatar = user.avatar ? `${BACKEND_URL}${user.avatar}` : AVATAR_DEFAUT;
			console.log("OUHHHHHHHH, ", profile.url_avatar)
            navigateTo("/intra");
        }
        if (response.status == 404)
        {
            navigateTo("/");
        }
    };

    return viewDiv;
}