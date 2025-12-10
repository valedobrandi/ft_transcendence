import { fetchRequest, toggle2FA } from "../utils";
import { profile } from "../app";
import { jwt } from "../app";
import { navigateTo } from "../utils";
import { Button } from "./Button";
import { endpoint } from "../endPoints";
import { stateProxyHandler } from "../states/stateProxyHandler";
const AVATAR_DEFAUT = "avatar_default.jpg"
const AVATAR1 = "avatar3.jpg"
const AVATAR2 = "avatar5.jpg"
const AVATAR3 = "avatar4.jpg"

export function ProfilePage(): HTMLElement {
	const root = document.createElement("div");
	root.className = "relative min-h-screen flex flex-col";

	const bg = document.createElement("div");
	bg.className = `
	absolute inset-0
	bg-[url('/profil.jpg')]
	bg-cover
	bg-center
	bg-no-repeat
	z-0
	`;
	root.appendChild(bg);

	// ---------- HEADER ----------
	const header = document.createElement("header");
	header.className = "relative z-10 px-6 pt-2";

	const headerInner = document.createElement("div");
	headerInner.className = "flex items-center justify-between relative";

	// Bouton flèche "Gaming Back"
	const backBtn = document.createElement("button");
	backBtn.className = `
		absolute left-0 top-2
		flex items-center justify-center
		w-12 h-12
		group
		transition
	`;

	backBtn.innerHTML = `
		<div class="
			w-12 h-12 flex items-center justify-center
			bg-black/40 border border-red-600
			rounded-xl
			shadow-[0_0_10px_rgba(255,0,0,0.4)]
			group-hover:shadow-[0_0_18px_rgba(255,0,0,0.9)]
			group-hover:border-red-500
			transition-all duration-200
			group-hover:scale-110
		">
			<svg xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				class="w-8 h-8 text-red-500 group-hover:text-red-400 transition">
				
				<!-- Chevron gaming stylisé -->
				<path fill="currentColor"
					d="M14.8 3.3 6.1 12l8.7 8.7 1.9-1.9L9.9 12l6.8-6.8-1.9-1.9z"/>
			</svg>
		</div>
	`;

	backBtn.onclick = () => {
		navigateTo("/intra");
	};


	// ===== Zone centre : Profil =====

	const titleContainer = document.createElement("div");
	titleContainer.className = "flex flex-1 justify-center px-20 py-3 w-[520px]";

	const title = document.createElement("h1");
	title.className = "game-font text-5xl text-[hsl(345,100%,47%)] text-shadow-lg/30 mb-1 text-center";
	title.textContent = "UPDATE PROFIL"
	titleContainer.appendChild(title);


	headerInner.appendChild(backBtn);
	headerInner.appendChild(titleContainer);
	header.appendChild(headerInner);
	root.appendChild(header);

	// ---------- MAIN ----------
	const main = document.createElement("main");
	main.className =
		"relative z-10 px-6 pt-3 flex-1 flex flex-col items-center justify-center mb-9";

	const card = document.createElement("div");
	card.className = "flex flex-col items-center bg-[#1e2124] border-4 border-gray-700 rounded-2xl shadow-lg px-20 py-3 w-[520px]";

	// ---------- Avatar section ----------
	const avatarSection = document.createElement("section");
	avatarSection.className = "flex flex-col gap-4 mb-5";

	const avatarLabel = document.createElement("label");
	avatarLabel.className = "font-abee text-white";
	avatarLabel.textContent = "Avatar";
	avatarSection.appendChild(avatarLabel);

	const avatarPreview = document.createElement("img");
	const avatarPath = `${endpoint.pong_backend_api}/avatar/${stateProxyHandler.profile.avatar}`;
	//console.log("AVATAR PATH:", avatarPath);
	avatarPreview.src = avatarPath;
	avatarPreview.id = "avatarPreview";
	avatarPreview.className = "w-24 h-24 rounded-full object-cover";
	avatarPreview.alt = "avatar";
	avatarSection.appendChild(avatarPreview);

	const avatarGrid = document.createElement("div");
	avatarGrid.id = "avatarGrid";
	avatarGrid.className = "grid grid-cols-4 gap-4 mt-1";

	function makePreset(dataset: string, src: string, label: string): HTMLButtonElement {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "preset-btn flex justify-center rounded-full";
		btn.dataset.src = dataset;
		btn.setAttribute("aria-label", label);

		const img = document.createElement("img");
		img.src = src;
		img.className = "rounded-full w-16 h-16 object-cover";
		img.alt = "";
		btn.appendChild(img);

		return btn;
	}

	avatarGrid.appendChild(makePreset(AVATAR1, `${endpoint.pong_backend_api}/avatar/${AVATAR1}`, "Avatar 1"));
	avatarGrid.appendChild(makePreset(AVATAR2, `${endpoint.pong_backend_api}/avatar/${AVATAR2}`, "Avatar 2"));
	avatarGrid.appendChild(makePreset(AVATAR3, `${endpoint.pong_backend_api}/avatar/${AVATAR3}`, "Avatar 3"));

	// Bouton "+"
	const pickFileBtn = document.createElement("button");
	pickFileBtn.type = "button";
	pickFileBtn.id = "pickFileAvatar";
	pickFileBtn.className =
		"w-16 h-16 rounded-full bg-[#36393e] flex items-center justify-center hover:bg-black/40 transition ring-0 focus:outline-none group";
	pickFileBtn.setAttribute("aria-label", "Add a custom avatar");

	pickFileBtn.innerHTML = `
		<svg viewBox="0 0 24 24" 
			class="w-7 h-7 text-black group-hover:text-red-500 transition" 
			fill="none" stroke="currentColor" stroke-width="2">
			
			<circle cx="12" cy="12" r="11" class="opacity-20"></circle>
			<path d="M12 7v10M7 12h10" />
		</svg>
	`;

	avatarGrid.appendChild(pickFileBtn);
	avatarSection.appendChild(avatarGrid);

	// input file caché
	const avatarFile = document.createElement("input");
	avatarFile.id = "avatarFile";
	avatarFile.type = "file";
	avatarFile.accept = "image/png,image/jpeg, image/jpg";
	avatarFile.className = "hidden";
	avatarSection.appendChild(avatarFile);

	card.appendChild(avatarSection);

	// ---------- Email ----------

	const emailSection1 = document.createElement("section");
	emailSection1.className = "flex flex-col gap-2 mt-4";

	const emailLabel = document.createElement("label");
	emailLabel.className = "font-abee text-white";
	emailLabel.textContent = `Email : ${profile.email}`;
	emailSection1.appendChild(emailLabel);

	const emailInput = document.createElement("input");
	emailInput.id = "change_email_input";
	emailInput.setAttribute("autocomplete", 'off');
	emailInput.type = "email";
	emailInput.placeholder = "change Email";
	emailInput.className =
		"w-full h-10 rounded-md px-3 bg-black text-indigo-100 focus:border-[hsl(345,100%,47%)] focus:ring-2 focus:ring-[hsl(345,100%,47%)] outline-none";
	emailSection1.appendChild(emailInput);

	card.appendChild(emailSection1);

	// ---------- Change name ----------

	const nameSection = document.createElement("section");
	nameSection.className = "flex flex-col gap-2 mt-4";

	const nameLabel = document.createElement("label");
	nameLabel.className = "font-abee text-white";
	nameLabel.textContent = `Name : ${profile.username} `;
	nameSection.appendChild(nameLabel);

	const nameInput = document.createElement("input");
	nameInput.id = "change_name_input";
	nameInput.type = "text";
	nameInput.placeholder = "change username";
	nameInput.className =
		"w-full h-10 rounded-md px-3 bg-black text-indigo-100 focus:border-[hsl(345,100%,47%)] focus:ring-2 focus:ring-[hsl(345,100%,47%)] outline-none";

	nameSection.appendChild(nameInput);
	card.appendChild(nameSection);

	// ---------- Change passeword ----------

	const passewordSection = document.createElement("section");
	passewordSection.className = "flex flex-col gap-4 mt-4";

	const passewordLabel = document.createElement("label");
	passewordLabel.className = "font-abee text-white";
	passewordLabel.textContent = `Password: `;
	passewordSection.appendChild(passewordLabel);

	const passewordInput = document.createElement("input");
	passewordInput.id = "current_password_input";
	passewordInput.type = "password";
	passewordInput.autocomplete = "off";
	passewordInput.placeholder = "current Password";
	passewordInput.className =
		"w-full h-10 rounded-md px-3 bg-black text-indigo-100 focus:border-[hsl(345,100%,47%)] focus:ring-2 focus:ring-[hsl(345,100%,47%)] outline-none";
	passewordSection.appendChild(passewordInput);

	const passewordLabels = document.createElement("label");
	passewordLabels.className = "font-abee text-white";
	passewordLabels.textContent = `New password: `;
	passewordSection.appendChild(passewordLabels);


	const newpassewordInput = document.createElement("input");
	newpassewordInput.id = "new_password_input";
	newpassewordInput.type = "password";
	newpassewordInput.placeholder = "**********";
	newpassewordInput.className =
		"w-full h-10 rounded-md px-3 bg-black contour-gray text-indigo-100 border-2 border-[#1e2124] focus:border-[hsl(345,100%,47%)] focus:ring-0,1 focus:[hsl(345,100%,47%)] outline-none";
	passewordSection.appendChild(newpassewordInput);

	card.appendChild(passewordSection);

	// ---------- Two-Factor Authentication  ----------

	function updateTwoFAButton() {
		twoFABtn.innerHTML = `
			<div class="flex items-center justify-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24" width="20" height="20"
					fill="${profile.twoFA_enabled ? "hsl(345,100%,47%)" : "none"}"
					stroke="currentColor" stroke-width="1.8"
					class="transition-all duration-300">
					<path stroke-linecap="round" stroke-linejoin="round"
						d="M16 10V7a4 4 0 10-8 0v3m-2 0h12a2 2 0 012 2v7a2 2 0
						01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z"/>
				</svg>
				<span>${profile.twoFA_enabled ? "Disable 2FA" : "Enable 2FA"}</span>
			</div>
		`;
	}

	// Popup confirmation

	function open2FAPopup() {
		const overlay = document.createElement("div");
		overlay.className = "fixed inset-0 bg-black/60 flex justify-center items-center z-50";

		const modal = document.createElement("div");
		modal.className = "bg-[#1e2124] p-8 rounded-xl border border-gray-700 flex flex-col gap-6 items-center w-[340px] shadow-xl";

		const text = document.createElement("p");
		text.className = "text-white text-center font-abee";
		text.textContent = profile.twoFA_enabled
			? "Do you really want to disable 2FA?"
			: "Enable 2FA on your account?";

		const yesBtn = document.createElement("button");
		yesBtn.className = "w-28 h-10 rounded-md bg-[hsl(345,100%,47%)] text-white hover:[hsl(345,100%,47%)]/20";
		yesBtn.textContent = "Yes";
		yesBtn.onclick = async () => {
			await toggle2FA();
			updateTwoFAButton();
			document.body.removeChild(overlay);
		};

		const cancelBtn = document.createElement("button");
		cancelBtn.className = "w-28 h-10 rounded-md bg-gray-500 text-white hover:bg-gray-600";
		cancelBtn.textContent = "Cancel";
		cancelBtn.onclick = () => document.body.removeChild(overlay);

		modal.appendChild(text);
		modal.appendChild(yesBtn);
		modal.appendChild(cancelBtn);

		overlay.appendChild(modal);
		document.body.appendChild(overlay);
	}

	// Two-Factor Authentication section

	const twoFASection = document.createElement("section");
	twoFASection.className = "flex flex-col gap-2 mt-4";

	const twoFALabel = document.createElement("label");
	twoFALabel.className = "font-abee text-white";
	twoFALabel.textContent = "Two-Factor Authentication (2FA)";
	twoFASection.appendChild(twoFALabel);

	const twoFABtn = document.createElement("button");
	twoFABtn.id = "toggle_2fa";
	twoFABtn.className =
		"w-full h-10 rounded-md px-3 bg-[#424549] text-white hover:bg-[#36393e]  transition border-2 border-[#282b30]";
	twoFABtn.innerHTML = `
    <div class="flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" width="20" height="20"
            fill="${profile.twoFA_enabled ? "hsl(345,100%,47%)" : "none"}"
            stroke="currentColor" stroke-width="1.8"
            class="transition-all duration-300">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M16 10V7a4 4 0 10-8 0v3m-2 0h12a2 2 0 012 2v7a2 2 0
                01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z"/>
        </svg>

        <span>
            ${profile.twoFA_enabled ? "Disable 2FA" : "Enable 2FA"}
        </span>
    </div>
`;

	twoFABtn.onclick = () => open2FAPopup();

	twoFASection.appendChild(twoFABtn);
	card.appendChild(twoFASection);


	// ----------change profil ----------

	const sendBtn = Button("Change profil", "w-full", () => { });
	sendBtn.className = "mt-4 w-full h-10 rounded-md px-3 bg-[hsl(345,100%,47%)] text-shadow-lg/30  text-white hover:bg-red-800  transition border-2 border-[#36393e]";
	//sendBtn.setAttribute("role", "button");
	card.appendChild(sendBtn);

	sendBtn.addEventListener("click", async () => {
		const nameEl = document.getElementById("change_name_input") as HTMLInputElement | null;
		const mailEl = document.getElementById("change_email_input") as HTMLInputElement | null;
		const curPwdEl = document.getElementById("current_password_input") as HTMLInputElement | null;
		const newPwdEl = document.getElementById("new_password_input") as HTMLInputElement | null;

		const nextName = nameEl?.value.trim() ?? "";
		const nextMail = mailEl?.value.trim() ?? "";
		const curPwd = curPwdEl?.value ?? "";
		const newPwd = newPwdEl?.value ?? "";

		const payload: Record<string, unknown> = {};
		if (nextName && nextName !== profile.username) {
			payload.username = nextName;
		}
		if (nextMail && nextMail !== profile.email) {
			payload.email = nextMail;
		}

		if (curPwd && newPwd) {
			payload.current_password = curPwd;
			payload.password = newPwd;
		}
		else if (curPwd || newPwd) {
			console.warn("To change the password, fill in both fields.");
			alert("To change the password, fill in both fields.");
			return;
		}

		if (Object.keys(payload).length === 0) {
			console.info("No changes to send.");
			alert("No changes to send.");
			return;
		}

		try {
			const data = await fetchRequest("/update", "PUT", {}, { body: JSON.stringify(payload) });
			//console.log("DATA FROM BACKEND:", data);

			if (data.message === 'success') {
				profile.username = data.payload.username;
				profile.email = data.payload.email;

				//console.log("Profile updated", data);
				alert(("your profil has changed "));
				const response = await fetchRequest(
					`/logout`,
					"GET"
				);
				if (response.message === "success") {
					navigateTo('/');
				}

			}
			else {
				console.error("Error loading profile: ", data);
				alert("Error loading profile: " + (data.error || "Erreur inconnue"));
			}

			if (payload.username)
				profile.username = String(payload.username);
			if (payload.email)
				profile.email = String(payload.email);

			if (nameEl) nameEl.value = profile.username ?? "";
			if (mailEl) mailEl.value = profile.email ?? "";

		} catch (error) {
			alert("Error update profile : " + (error) || "Erreur inconnue");
		} finally {

		}
	});
	main.appendChild(card);
	root.appendChild(main);

	// ---------- FOOTER ----------
	// ---------- --- ----------

	setTimeout(() => {
		void handleProfilePage(avatarPreview, pickFileBtn, avatarFile, avatarGrid);
	}, 50);

	return root;
}

export async function handleProfilePage(avatarPreview: HTMLImageElement, pickFileBtn: HTMLButtonElement,
	avatarFile: HTMLInputElement, avatarGrid: HTMLDivElement): Promise<void> {
	//console.log("handleProfilePage called");
	//console.log("DOM check:", {
	//});

	let data;
	try {
		data = await fetchRequest(`/profile`, 'GET', {}, {});
	} catch (err) {
		console.error("Error réseau on /profile:", err);
		window.location.hash = "/login";
		return;
	}

	if (data.message !== "success") {
		console.warn("Profile not access:", data);
		window.location.hash = "/login";
		return;
	}

	const user = data.existUser;

	upload_avatar(user, avatarPreview, avatarGrid);
	bind_user_avatar_upload(user, avatarPreview, pickFileBtn, avatarFile);

}

export function bind_user_avatar_upload(user: { avatar_url: string | null }, avatarPreview: HTMLImageElement,
	pickFileBtn: HTMLButtonElement,
	avatarFile: HTMLInputElement): void {

	avatarPreview.onerror = () => {
		avatarPreview.onerror = null;
		avatarPreview.src = `${endpoint.pong_backend_api}/avatar/${AVATAR_DEFAUT}`;
	};

	pickFileBtn.addEventListener("click", () => avatarFile.click());

	avatarFile.addEventListener("change", async () => {
		const f = avatarFile.files?.[0];
		if (!f) return;

		const allow = ["image/png", "image/jpeg", "image/jpg"];
		if (!allow.includes(f.type) || f.size > 5 * 1024 * 1024) {
			avatarFile.value = "";
			//console.log("image format error");
			return;
		}

		const tempUrl = URL.createObjectURL(f);
		avatarPreview.src = tempUrl;

		const fd = new FormData();
		fd.append("avatar", f);

		try {
			const res = await fetch(`${endpoint.pong_backend_api}/avatar`, {
				method: "POST",
				headers: { Authorization: `Bearer ${jwt.token}` },
				body: fd
			});
			
			const data = await res.json();
			if (!data.payload?.avatar_url) throw new Error("Avatar not receved");


			//console.log("AVATAR SAVED AT DB:", data.payload.avatar_url);
			user.avatar_url = data.payload.avatar_url;
			profile.avatar_url = data.payload.avatar_url;

			avatarPreview.src = `${endpoint.pong_backend_api}/avatar/${profile.avatar_url}`;
		} catch (err) {
			console.error("Upload failed:", err);
			avatarPreview.src = user.avatar_url ? `${user.avatar_url}` : AVATAR_DEFAUT;
		} finally {
			URL.revokeObjectURL(tempUrl);
			avatarFile.value = "";
		}
	});
}

export function upload_avatar(user: { avatar_url: string | null }, avatarPreview: HTMLImageElement,
	avatarGrid: HTMLDivElement): void {

	if (!avatarPreview || !avatarGrid) {
		console.warn("upload_avatar: avatarPreview ou avatarGrid introuvable dans le DOM");
		return;
	}


	avatarPreview.onerror = () => {
		avatarPreview.onerror = null;
		avatarPreview.src = AVATAR_DEFAUT;
	};

	//console.log(user.avatar_url);

	const presetButtons = avatarGrid.querySelectorAll<HTMLButtonElement>(".preset-btn");

	function highlight(btn: HTMLButtonElement | null) {
		presetButtons.forEach((button) => {
			button.classList.remove("ring-4", "ring-indigo-400");
		});
		if (btn) {
			btn.classList.add("ring-4", "ring-[hsl(345,100%,47%)]");
		}
	}

	// détermine le bouton sélectionné au chargement
	let selected: HTMLButtonElement | null = null;

	presetButtons.forEach((b) => {
		if (b.dataset.src === user.avatar_url) {
			selected = b;
		}
	});

	highlight(selected);

	// clique sur les boutons d'avatar
	presetButtons.forEach((btn) => {
		btn.addEventListener("click", async () => {
			const url = btn.dataset.src;

			// On met à jour tout de suite côté UI
			const oldSrc = avatarPreview.src;
			highlight(btn);

			try {
				const res = await fetchRequest(
					`/avatar`,
					"PUT",
					{},
					{ body: JSON.stringify({ avatar_url: url }) }
				);
				if (res.error) {
					console.error("Server error:", res.status, await res.text());
					return;
				}
				user.avatar_url = res.payload.avatar_url;
				profile.avatar_url = res.payload.avatar_url;
				avatarPreview.src = `${endpoint.pong_backend_api}/avatar/${profile.avatar_url}`;

				highlight(btn);
				selected = btn;
			} catch (err) {
				console.error("change avatar update failed:", err);
				avatarPreview.src = oldSrc;
				highlight(selected);
			}
		});
	});
}