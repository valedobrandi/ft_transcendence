// import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
// import { InputName } from "./InputName";
// import { InputPassword } from "./InputPassword";
// import { fetchRequest, navigateTo } from "../utils";
import { profile } from "../app";


function Email()
{

}


function Username()
{
	const fieldset = document.createElement("fieldset");
	fieldset.className = "border p-4 rounded max-w-xs w-full";

	const legend = document.createElement("legend");
	legend.className = "text-sm font-semibold text-gray-700";
	legend.textContent = `Username: ${profile.username}`;

	// const passwordInput = document.createElement("input");
	// passwordInput.type = "password";
	// passwordInput.id = "register_password";
	// passwordInput.placeholder = "Enter your password";
	// passwordInput.className = `px-4 py-2 border rounded w-full
	// 	focus:outline-none focus:ring-2 focus:ring-blue-500`;

	fieldset.appendChild(legend);
	//fieldset.appendChild(passwordInput);

	return fieldset;
}

export function ProfilePage():HTMLElement
{
	const viewDiv = document.createElement("div");
    viewDiv.className = "flex flex-col h-screen";

    const headerBar = HeaderBar("Profile");

    const formElement = document.createElement("form");
	formElement.className = "flex flex-col justify-center items-center flex-grow gap-2 maw-w-sm mx-auto";

    formElement.onsubmit = (e) => {
        e.preventDefault();
    };

    const usernameElement = Username();
	// const emailElemant = Email();

    viewDiv.appendChild(headerBar);
    viewDiv.appendChild(formElement);

    formElement.appendChild(usernameElement);
    
    return viewDiv;
}