export function InputName() {
	const fieldset = document.createElement("fieldset");
	fieldset.className = "border p-4 rounded w-1/3";

	const legend = document.createElement("legend");
	legend.className = "text-sm font-semibold text-gray-700";
	legend.textContent = "Name";

	const nameInput = document.createElement("input");
	nameInput.type = "text";
	nameInput.placeholder = "Enter your name";
	nameInput.className = `px-4 py-2 border rounded w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500`;

	fieldset.appendChild(legend);
	fieldset.appendChild(nameInput);

	return fieldset;
}
