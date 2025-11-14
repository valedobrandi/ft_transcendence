export function InputPassword():HTMLElement {
	const container = document.createElement("div");
	container.className = "flex flex-col gap-1";

	const label = document.createElement("label");
	label.htmlFor = "register_password";
	label.className = "text-sm font-semibold text-gray-300 tracking-wide";
	label.textContent = "Password";

	const input = document.createElement("input");
	input.id = "register_password";
	input.type = "password";
	input.placeholder = "Enter your password";
	input.className = `
		bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700
		focus:outline-none focus:ring-2 focus:ring-[hsl(345,100%,47%)] focus:border-transparent
		placeholder-gray-500 transition-all duration-200
	`;

	container.appendChild(label);
	container.appendChild(input);

	return container;
}
