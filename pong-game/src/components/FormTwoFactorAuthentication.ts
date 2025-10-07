import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputNumber } from "./InputNumber";

export function FormTwoFactorAuthentication(): HTMLElement {
    const viewDiv = document.createElement("div");
    viewDiv.className = "flex flex-col h-screen";

    const headerBar = HeaderBar("Two-Factor Authentication");

    const formElement = document.createElement("form");
    formElement.className = `flex flex-col justify-center items-center
        flex-grow gap-4 maw-w-sm mx-auto`;

    formElement.onsubmit = (e) => {
        e.preventDefault();
        console.log("2FA code submitted");
    };

    const inputAuthUI = InputNumber();
    formElement.appendChild(inputAuthUI);

    const sendBtn = Button("Send", "w-full", () => {});
    formElement.appendChild(sendBtn);
	sendBtn.onclick = () => {
		fetch("localhost/auth") 
	}


    viewDiv.appendChild(headerBar);
    viewDiv.appendChild(formElement);

    return viewDiv;
}
