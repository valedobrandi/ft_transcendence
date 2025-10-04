export function InputPassword():HTMLElement {
	const fieldset = document.createElement("fieldset");
	fieldset.className = "border p-4 rounded max-w-xs w-full";

	const legend = document.createElement("legend");
	legend.className = "text-sm font-semibold text-gray-700";
	legend.textContent = "Password";

	const passwordInput = document.createElement("input");
	passwordInput.type = "password";
	passwordInput.placeholder = "Enter your password";
	passwordInput.className = `px-4 py-2 border rounded w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500`;

	fieldset.appendChild(legend);
	fieldset.appendChild(passwordInput);

	return fieldset;
}