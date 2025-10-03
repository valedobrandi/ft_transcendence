import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputNumber } from "./InputNumber";

export function TwoFactorAuthentication(): HTMLElement {
    const viewDiv = document.createElement("div");
    viewDiv.className = "flex flex-col h-screen";

    const headerBar = HeaderBar("Two-Factor Authentication");

    const form = document.createElement("form");
    form.className = "flex flex-col justify-center items-center flex-grow gap-4";

    form.onsubmit = (e) => {
        e.preventDefault();
        console.log("2FA code submitted");
    };

    const inputAuthUI = InputNumber();
    form.appendChild(inputAuthUI);
    const sendBtn = Button("Send", "w-[295px]", () => {});
    form.appendChild(sendBtn);


    viewDiv.appendChild(headerBar);
    viewDiv.appendChild(form);

    return viewDiv;
}
