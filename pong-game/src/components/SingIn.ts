import { HeaderBar } from "./HeaderBar";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";

export function SingIn(): HTMLElement {
	const viewDiv = document.createElement("div");
    viewDiv.className = "flex flex-col h-screen";

    const headerBar = HeaderBar("Sing-in");

    const mainContent = document.createElement("div");
    mainContent.className = "flex flex-col justify-center items-center flex-grow gap-2";

	const inputPasswordUI = InputPassword();
	const inputNameUI = InputName();

	viewDiv.appendChild(headerBar);
    viewDiv.appendChild(mainContent);
	mainContent.appendChild(inputNameUI);
	mainContent.appendChild(inputPasswordUI);

    return viewDiv;
}