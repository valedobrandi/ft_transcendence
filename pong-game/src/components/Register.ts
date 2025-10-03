import { HeaderBar } from "./HeaderBar";
import { InputEmail } from "./InputEmail";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";

export function Register(): HTMLElement {
	const viewDiv = document.createElement("div");
	viewDiv.className = "flex flex-col h-screen";

	const headerBar = HeaderBar("Register");

	const mainContent = document.createElement("div");
	mainContent.className = "flex flex-col justify-center items-center flex-grow gap-2";

	const inputPasswordUI = InputPassword();
	const inputNameUI = InputName();
	const inputEmailUi = InputEmail();

	viewDiv.appendChild(headerBar);
	viewDiv.appendChild(mainContent);

	mainContent.appendChild(inputNameUI);
	mainContent.appendChild(inputEmailUi);
	mainContent.appendChild(inputPasswordUI);

	return viewDiv;
}