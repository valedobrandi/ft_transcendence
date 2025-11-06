export function InputEmail() {
	const fieldset = document.createElement("fieldset");
	fieldset.className = "border p-4 rounded max-w-xs w-full";

	const legend = document.createElement("legend");
	legend.className = "text-sm font-semibold text-gray-700";
	legend.textContent = "Email";

	const nameInput = document.createElement("input");
	nameInput.type = "email";
	nameInput.id = "register_email";
	nameInput.placeholder = "Enter your email";
	nameInput.className = `px-4 py-2 border rounded w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500`;

	fieldset.appendChild(legend);
	fieldset.appendChild(nameInput);

	return fieldset;
}
