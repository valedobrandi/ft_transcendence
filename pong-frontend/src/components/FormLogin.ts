import { FancyButton, ReturnButton } from "./Button";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";
import { fetchRequest, navigateTo } from "../utils";
import { profile, jwt } from "../app";
import { removeLocalStorage, stateProxyHandler } from "../states/stateProxyHandler";
import { CreateAlert } from "./CreateAlert";
import { disconnectSocket, initSocket } from "../websocket";
import { websocketConnect } from "../websocket/websocketConnect";

export function FormLogin(): HTMLElement {
	const viewDiv = document.createElement("div");
	viewDiv.className = "flex items-center justify-center h-screen";
	viewDiv.style.backgroundImage = "url('/default_background.jpg')";
	viewDiv.style.backgroundSize = "cover";

	const backBtn = ReturnButton("/");
	viewDiv.appendChild(backBtn);

	const card = document.createElement("div");
	card.className = "flex flex-col items-center bg-gray-950 border-4 border-gray-700 rounded-2xl shadow-lg px-20 py-12 w-[520px]";

	const title = document.createElement("h1");
	title.className = "game-font text-5xl text-[hsl(345,100%,47%)] text-shadow-lg/30 mb-8 text-center";
	title.textContent = "WELCOME BACK";

	const formElement = document.createElement("form");
	formElement.className = "flex flex-col justify-center items-center flex-grow gap-8";

	formElement.onsubmit = (event) => {
		event.preventDefault();
		console.log("2FA code submitted");
	};

	// Add inputs Name + Password to the form
	const inputContainer = document.createElement("div");
	inputContainer.className = "flex flex-col gap-10 w-full";

	const inputNameUI = InputName();
	inputContainer.appendChild(inputNameUI);
	const inputPasswordUI = InputPassword();
	inputContainer.appendChild(inputPasswordUI);

	const sendBtn = FancyButton("login", "scale-100 h-14 w-60 game-font tracking-widest text-lg", () => { });

	viewDiv.appendChild(title);
	viewDiv.appendChild(formElement);
	formElement.appendChild(inputNameUI);
	formElement.appendChild(inputPasswordUI);
	formElement.appendChild(sendBtn);

	// -------------------------
	// POPUP 2FA
	// -------------------------

	function create2FAPopup(id: number) {
		const overlay = document.createElement("div");
		overlay.className = "fixed inset-0 bg-black/60 flex justify-center items-center z-50";

		const modal = document.createElement("div");
		modal.className = "bg-[#1e2124] p-8 rounded-xl border border-[#424549] flex flex-col gap-6 items-center w-fit shadow-xl";
		modal.id = "enter-2fa-code";

		const title = document.createElement("h2");
		title.className = "text-3xl game-font text-[hsl(345,100%,47%)]";
		title.textContent = "2FA Code";

		const subtitle = document.createElement("p");
		subtitle.className = "text-gray-300 text-center";
		subtitle.textContent = "ENTER THE 6-DIGIT CODE FROM YOUR AUTHENTICATOR APP";

		const input = document.createElement("input");
		input.type = "text";
		input.maxLength = 6;
		input.className = "text-gray-200 bg-black px-4 py-2 rounded w-full";
		input.placeholder = "123456";

		const error = document.createElement("p");
		error.className = "text-red-500 text-sm hidden";

		const confirmBtn = FancyButton("confirm", "h-12 w-46 text-sm game-font tracking-widest flex items-center justify-center", async () => {

			const code = input.value.trim();

			if (code.length !== 6) {
				error.textContent = "The code must contain 6 digits.";
				error.classList.remove("hidden");
				return;
			}

			const verifyResponse = await fetchRequest(
				"/twoFA", "POST", {}, { body: JSON.stringify({ id, code }) }
			);

			if (verifyResponse.message === "invalid_code") {
				error.textContent = "Incorrect code.";
				error.classList.remove("hidden");
				return;
			}

			if (verifyResponse.message === "code_expired") {
				error.textContent = "Code expired. Please log in again.";
				error.classList.remove("hidden");
				return;
			}

			if (verifyResponse.message === "success") {
				localStorage.setItem('jwt_token', verifyResponse.payload.accessToken);
				document.body.removeChild(overlay);
				navigateTo("/login");
			}
		});

		const cancelBtn = FancyButton("cancel", "h-12 w-46 text-sm game-font tracking-widest flex items-center justify-center", () => {
			document.body.removeChild(overlay);
		});

		modal.appendChild(title);
		modal.appendChild(subtitle);
		modal.appendChild(input);
		modal.appendChild(error);
		modal.appendChild(confirmBtn);
		modal.appendChild(cancelBtn);

		overlay.appendChild(modal);
		document.body.appendChild(overlay);
	}

	// -------------------------
	// FETCH LOGIN
	// -------------------------

	formElement.onsubmit = async (e) => {
		e.preventDefault();

		const username_input = document.getElementById('register_username') as HTMLInputElement;
		const password_input = document.getElementById('register_password') as HTMLInputElement;
		if (username_input === null || password_input === null) return;

		const username = username_input.value.trim();
		const password = password_input.value.trim();

		const response = await fetchRequest(
			`/login`,
			'POST',
			{},
			{ body: JSON.stringify({ username, password }) }
		);

		if (response.message === "2FA_REQUIRED") {
			create2FAPopup(
				response.data.userId,
			);
			return;
		}

		if (response.message === 'success') {

			removeLocalStorage();
			stateProxyHandler.reset();
			disconnectSocket();

			jwt.token = response.payload.accessToken;
			localStorage.setItem('jwt_token', jwt.token || '');

			profile.username = response.payload.username;
			profile.id = response.payload.id;

			stateProxyHandler.chat = { id: profile.id, name: profile.username };

			const [friendsList, blockedList] = await Promise.all([
				fetchRequest('/friends-list', 'GET', {}),
				fetchRequest('/block-list', 'GET', {})
			]);

			if (friendsList.message === 'success') {
				stateProxyHandler.friendList = friendsList.payload;
				console.log("[FRIEND LIST ON LOGIN]", stateProxyHandler.friendList);
			}
			if (blockedList.message === 'success') {
				stateProxyHandler.chatBlockList = blockedList.payload;
			}

			initSocket();
			await websocketConnect();

			navigateTo("/intra");

		} else if (response.status === 'error') {
			const existingAlert = document.getElementById("alert-popup");
			if (existingAlert)
				existingAlert.remove();
			document.getElementById('root')?.prepend(CreateAlert(response.message));
		}
	};

	card.appendChild(title);
	card.appendChild(formElement);
	viewDiv.appendChild(card);

	return viewDiv;
}
