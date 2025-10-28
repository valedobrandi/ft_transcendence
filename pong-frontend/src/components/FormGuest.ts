import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputName } from "./InputName";

export function FormGuest(): HTMLElement {
    const viewDiv = document.createElement("div");
	viewDiv.className = "flex flex-col items-center h-screen";

    const headerBar = HeaderBar("Guest Access");

    const formElement = document.createElement("form");
    formElement.className = "flex flex-col mt-[100px] flex-grow gap-2 maw-w-sm";

    formElement.onsubmit = (e) => {
        e.preventDefault();
        console.log("2FA code submitted");
    };

	const inputNameUI = InputName();

    const sendBtn = Button("enter", "h-14 game-font tracking-widest text-lg", () => {});

	viewDiv.appendChild(headerBar);
    viewDiv.appendChild(formElement);
	formElement.appendChild(inputNameUI);
    formElement.appendChild(sendBtn);

    return viewDiv;
}