import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";

export function FormSingIn(): HTMLElement {
	const viewDiv = document.createElement("div");
    viewDiv.className = "flex flex-col h-screen";

    const headerBar = HeaderBar("Sing-in");

    const formElement = document.createElement("form");
    formElement.className = "flex flex-col justify-center items-center flex-grow gap-2 maw-w-sm mx-auto";

    formElement.onsubmit = (e) => {
        e.preventDefault();
        console.log("2FA code submitted");
    };

	const inputPasswordUI = InputPassword();
	const inputNameUI = InputName();

    const sendBtn = Button("sing-in", "w-full", () => {});
    
	viewDiv.appendChild(headerBar);
    viewDiv.appendChild(formElement);
	formElement.appendChild(inputNameUI);
	formElement.appendChild(inputPasswordUI);
    formElement.appendChild(sendBtn);

    return viewDiv;
}