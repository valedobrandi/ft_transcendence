// import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
// import { InputName } from "./InputName";
// import { InputPassword } from "./InputPassword";
import { fetchRequest, navigateTo } from "../utils";
import { profile } from "../app";
// import { profile, jwt } from "../app";

import { Button } from "./Button";
const AVATAR_DEFAUT = "/default/avatar_default.jpg"
const AVATAR1 = "/default/avatar1.jpg"
const AVATAR2 = "/default/avatar2.jpg"
const AVATAR3 = "/default/avatar3.jpg"
// À adapter selon ton projet
// import { API_URL, fetchWithAuth } from "./api";
// import { AVATAR_DEFAUT, AVATAR1, AVATAR2, AVATAR3, languageSvg } from "./assets";
// import { upload_avatar, bind_user_avatar_upload, update_name } from "./profileHelpers";

export function ProfilePage(): HTMLElement {
	const root = document.createElement("div");
	root.className = "relative min-h-screen flex flex-col";

	// Background image
	 const bg = document.createElement("div");
  bg.className = `
    absolute inset-0
    bg-[url('/default/.jpg')]
    bg-[length:100%_auto]
    bg-center
    bg-no-repeat
    z-0
`;
    root.appendChild(bg);

	// ---------- HEADER ----------
	const header = document.createElement("header");
	header.className = "relative z-10 px-6 pt-8";

	const headerInner = document.createElement("div");
	headerInner.className = "flex justify-between items-center";

	const homeLink = document.createElement("a");
	homeLink.href = "#/";
	homeLink.className =
		"rounded-md bg-dark-blue px-6 py-2 font-bagel text-smoky-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/60";
	homeLink.textContent = "Home";

	// headerInner.appendChild(title);
	headerInner.appendChild(homeLink);
	header.appendChild(headerInner);
	root.appendChild(header);

	// ---------- MAIN ----------
	const main = document.createElement("main");
	main.className =
		"relative z-10 px-6 pt-8 flex-1 flex flex-col items-center justify-center mb-8";

	const card = document.createElement("div");
	card.className = "place-self-center w-fit px-16 py-8 rounded-xl bg-mblue-500 opacity-80 ";

	// Welcome
	const h3 = document.createElement("h3");
	h3.className = "text-3xl font-bagel text-smoky-white text-center";
	h3.innerHTML = `Welcome ${profile.username} !`
	card.appendChild(h3);

	// ---------- Avatar section ----------
	const avatarSection = document.createElement("section");
	avatarSection.className = "flex flex-col gap-3 mt-4";

	const avatarLabel = document.createElement("label");
	avatarLabel.className = "font-abee text-smoky-white";
	avatarLabel.textContent = "Avatar";
	avatarSection.appendChild(avatarLabel);

	const avatarPreview = document.createElement("img");
	avatarPreview.id = "avatarPreview";
	avatarPreview.className = "w-24 h-24 rounded-full object-cover";
	avatarPreview.src = `${profile.url_avatar}`;
	avatarPreview.alt = "avatar";
	avatarSection.appendChild(avatarPreview);

	const avatarGrid = document.createElement("div");
	avatarGrid.id = "avatarGrid";
	avatarGrid.className = "grid grid-cols-4 gap-3";

	function makePreset(src: string, label: string): HTMLButtonElement {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "preset-btn flex justify-center rounded-full";
		btn.dataset.src = src;
		btn.setAttribute("aria-label", label);

		const img = document.createElement("img");
		img.src = src;
		img.className = "rounded-full w-16 h-16 object-cover";
		img.alt = "";
		btn.appendChild(img);

		return btn;
	}

	avatarGrid.appendChild(makePreset(AVATAR1 as string, "Avatar 1"));
	avatarGrid.appendChild(makePreset(AVATAR2 as string, "Avatar 2"));
	avatarGrid.appendChild(makePreset(AVATAR3 as string, "Avatar 3"));

	// Bouton "+"
	const pickFileBtn = document.createElement("button");
	pickFileBtn.type = "button";
	pickFileBtn.id = "pickFileAvatar";
	pickFileBtn.className =
		"w-16 h-16 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/40 transition ring-0 focus:outline-none";
	pickFileBtn.setAttribute("aria-label", "Ajouter un avatar personnalisé");

	pickFileBtn.innerHTML = `
		<svg viewBox="0 0 24 24" class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2">
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
	avatarFile.accept = "image/png,image/jpeg";
	avatarFile.className = "hidden";
	avatarSection.appendChild(avatarFile);

	card.appendChild(avatarSection);

	// // Message avatar
	// const avatarMsg = document.createElement("p");
	// avatarMsg.id = "avatarMsg";
	// avatarMsg.className = "text-sm text-indigo-200";
	// card.appendChild(avatarMsg);

	// ---------- Email ----------

	const emailSection1 = document.createElement("section");
	emailSection1.className = "flex flex-col gap-2 mt-4";

	const emailLabel = document.createElement("label");
	emailLabel.className = "font-abee text-smoky-white";
	emailLabel.textContent = `Email : ${profile.email}`;
	emailSection1.appendChild(emailLabel);

	const emailInput = document.createElement("input");
	emailInput.id = "change_email_input";
	emailInput.type = "email";
	emailInput.placeholder = "change Email";
	emailInput.className =
		"w-full h-10 rounded-md px-3 bg-black/30 text-indigo-100 outline-none";
	emailSection1.appendChild(emailInput);

	card.appendChild(emailSection1);

	// ---------- Change name ----------

	const nameSection = document.createElement("section");
	nameSection.className = "flex flex-col gap-2 mt-4";

	const nameLabel = document.createElement("label");
	nameLabel.className = "font-abee text-smoky-white";
	nameLabel.textContent = `Name : ${profile.username} `;
	nameSection.appendChild(nameLabel);

	const nameInput = document.createElement("input");
	nameInput.id = "change_name_input";
	nameInput.type = "text";
	nameInput.placeholder = "change username";
	nameInput.className =
		"w-full h-10 rounded-md px-3 bg-black/30 text-indigo-100 outline-none";
	nameSection.appendChild(nameInput);

	card.appendChild(nameSection);


	// ---------- Change passeword ----------
	
	const passewordSection = document.createElement("section");
	passewordSection.className = "flex flex-col gap-2 mt-4";

	const passewordLabel = document.createElement("label");
	passewordLabel.className = "font-abee text-smoky-white";
	passewordLabel.textContent = `Password: `;
	passewordSection.appendChild(passewordLabel);

	const passewordInput = document.createElement("input");
	passewordInput.id = "current_password_input";
	passewordInput.type = "password";
	passewordInput.autocomplete = "off";
	passewordInput.placeholder = "current Password";
	passewordInput.className =
	"w-full h-10 rounded-md px-3 bg-black/30 text-indigo-100 outline-none";
	passewordSection.appendChild(passewordInput);
	
	const passewordLabels = document.createElement("label");
	passewordLabels.className = "font-abee text-smoky-white";
	passewordLabels.textContent = `New password: `;
	passewordSection.appendChild(passewordLabels);


	const newpassewordInput = document.createElement("input");
	newpassewordInput.id = "new_password_input";
	newpassewordInput.type = "password";
	newpassewordInput.placeholder = "**********";
	newpassewordInput.className =
		"w-full h-10 rounded-md px-3 bg-black/30 text-indigo-100 outline-none";
	passewordSection.appendChild(newpassewordInput);

	card.appendChild(passewordSection);

	// ----------change profil ----------
	
	const sendBtn = Button("Change profil", "w-full", () => {});
	sendBtn.className =	"mt-4 w-full h-10 rounded-md px-3 bg-pink-400 text-white outline-none";
	card.appendChild(sendBtn);

	sendBtn.addEventListener("click", async () => {
	const nameEl  = document.getElementById("change_name_input") as HTMLInputElement | null;
	const mailEl  = document.getElementById("change_email_input") as HTMLInputElement | null;
	const curPwdEl = document.getElementById("current_password_input") as HTMLInputElement | null;
	const newPwdEl = document.getElementById("new_password_input") as HTMLInputElement | null;

	const nextName = nameEl?.value.trim() ?? "";
	const nextMail = mailEl?.value.trim() ?? "";
	const curPwd   = curPwdEl?.value ?? "";
	const newPwd   = newPwdEl?.value ?? "";

	const payload: Record<string, unknown> = {};
	if (nextName && nextName !== profile.username)
	{
		payload.username = nextName;
	}
	if (nextMail && nextMail !== profile.email)
	{
		payload.email = nextMail;
	}

	if (curPwd && newPwd)
	{
		payload.current_password = curPwd;
		payload.password = newPwd;
	} 
	else if (curPwd || newPwd) 
	{
		console.warn("To change the password, fill in both fields.");
		alert("To change the password, fill in both fields.");
		return;
	}

	if (Object.keys(payload).length === 0)
	{
		console.info("No changes to send.");
		alert("No changes to send.");
		return;
	}

	try {
	//sendBtn.setAttribute('disabled','true');
	const data = await fetchRequest("/update", "PUT", {}, payload);
	
	if (data.message === 'success')
	{
		profile.username = data.payload.username;
		profile.email = data.payload.email;

		console.log("Profile updated", data);
		window.location.reload();	
	}
	else
	{
		console.error("Error loading profile: ", data);
		alert("Error loading profile: " + (data.error || "Erreur inconnue"));
	}

	if (payload.username) profile.username = String(payload.username);
	if (payload.email)    profile.email    = String(payload.email);

	
	if (nameEl) nameEl.value = profile.username ?? "";
	if (mailEl) mailEl.value = profile.email ?? "";

	} catch (e) {
	console.error("Erreur réseau :", e);
	alert("Erreur lors de la mise à jour : " + (e || "Erreur inconnue"));
	} finally {
	//endBtn.setAttribute('disabled','false');;
	}
	});
	main.appendChild(card);
	root.appendChild(main);

	// ---------- FOOTER ----------
	const footer = document.createElement("footer");
	footer.className = "relative z-10 px-6 pb-6";

	const footerInner = document.createElement("div");
	footerInner.className = "relative";

	const langLink = document.createElement("a");
	langLink.href = "#lang";
	langLink.className =
		"pointer-events-auto absolute left-0 -bottom-2 grid h-10 w-10 place-items-center rounded-md bg-dark-blue text-smoky-white hover:brightness-110";

	const langImg = document.createElement("img");
	// langImg.src = languageSvg as string;
	langImg.className = "w-[1.5em] h-[1.5em]";
	langImg.alt = "language icon";

	langLink.appendChild(langImg);
	footerInner.appendChild(langLink);

	footer.appendChild(footerInner);
	// root.appendChild(footer);

	// Lance la logique de récupération des infos utilisateur
	void handleProfilePage();

	return root;
}

export async function handleProfilePage(): Promise<void> {
			console.log("handleProfilePage called");
		console.log("DOM check:", {
		preview: document.getElementById("avatarPreview"),
		grid: document.getElementById("avatarGrid"),
		plus: document.getElementById("pickFileAvatar"),
		file: document.getElementById("avatarFile"),
	});

	let data;
	try {
		data = await fetchRequest(`/profile`, 'GET', {}, {});
	} catch (err) {
		console.error("Erreur réseau sur /profile:", err);
		window.location.hash = "/login";
		return;
	}

	if (data.message !== "success") {
		console.warn("Profile non accessible:", data);
		window.location.hash = "/login";
		return;
	}

	const user = data.user;

	const usernameSpan = document.getElementById("username");
	const emailSpan = document.getElementById("useremail");
	const nameInput = document.getElementById("change_name_input") as HTMLInputElement | null;

	if (usernameSpan) usernameSpan.textContent = user.name;
	if (emailSpan) emailSpan.textContent = user.email;
	if (nameInput) nameInput.value = user.name ?? "";

	upload_avatar(user);
	bind_user_avatar_upload(user);
	update_name();

	const logoutBtn = document.getElementById("logout");
	if (logoutBtn) {
		logoutBtn.addEventListener("click", () => {
			localStorage.removeItem("accessToken"); // au cas où tu l’utilises plus tard
			window.location.hash = "/login";
		});
	}
}

export function bind_user_avatar_upload(user: { avatar_url: string | null }): void 
{
	//recuperer les bouttons
	const preview = document.getElementById("avatarPreview") as HTMLImageElement;
	const plusBtn = document.getElementById("pickFileAvatar") as HTMLButtonElement;
	const fileInput = document.getElementById("avatarFile") as HTMLInputElement;

	// si on charge une image invalide → fallback
  	preview.onerror = () => {
    	preview.onerror = null;
    	preview.src = AVATAR_DEFAUT;
	};
	// ouvre le file picker, fileInput.click() pour ouvrir le sélecteur de fichiers.
	plusBtn.addEventListener("click", () => fileInput.click());

	fileInput.addEventListener("change", async() => {
		const f = fileInput.files?.[0]
		if (!f)
			return ;

		const allow = ["image/png", "image/jpeg"];
		const size_photo = 5 * 1024 * 1024;

		if (!allow.includes(f.type) || f.size > size_photo)
		{
			fileInput.value = "";
			console.log("image format error");
			return ;
		}

		const url = URL.createObjectURL(f);
		preview.src = url;

		const fd = new FormData();
		fd.append("avatar", f);
		try{
			const res = await fetchRequest(
					`profile/avatar`,
					'POST',
					{},
					{fd}

			);
			if (!res.ok) {
				console.error("Server error:", res.status, await res.text());
				
				return;
			}
			const data = await res.json() as {avatar_url:string};
			const { avatar_url } = data; 
			console.log("avatar upload success:");
			preview.src = avatar_url;
			user.avatar_url = avatar_url;
			window.location.reload();
		}
		catch
		{
			console.error("Upload failed:");
	    	preview.src = user.avatar_url ?? AVATAR_DEFAUT;
		}
		finally
		{
			URL.revokeObjectURL(url);
			fileInput.value = "";
		}
	});
};

export function upload_avatar(user: { avatar_url: string | null }): void {
	const preview = document.getElementById("avatarPreview") as HTMLImageElement | null;
	const grid = document.getElementById("avatarGrid") as HTMLDivElement | null;

	console.log('dans update_avatar')

	if (!preview || !grid) {
		console.warn("upload_avatar: avatarPreview ou avatarGrid introuvable dans le DOM");
		return;
	}

	// Fallback si l'image échoue (évite une image cassée)
	preview.onerror = () => {
		preview.onerror = null;
		preview.src = AVATAR_DEFAUT;
	};

	// Image initiale
	
	preview.src = `${profile.url_avatar}` || AVATAR_DEFAUT;

	const presetButtons = grid.querySelectorAll<HTMLButtonElement>(".preset-btn");

	function highlight(btn: HTMLButtonElement | null) {
		presetButtons.forEach((button) => {
			button.classList.remove("ring-4", "ring-indigo-400");
		});
		if (btn) {
			btn.classList.add("ring-4", "ring-indigo-400");
		}
	}

	// On détermine le bouton sélectionné au chargement
	let selected: HTMLButtonElement | null = null;

	presetButtons.forEach((b) => {
		if (b.dataset.src === user.avatar_url) {
			selected = b;
		}
	});

	highlight(selected);

	// IMPORTANT : on clique sur les boutons d'avatar
	presetButtons.forEach((btn) => {
		btn.addEventListener("click", async () => {
			const url = btn.dataset.src || AVATAR_DEFAUT;

			// On met à jour tout de suite côté UI
			preview.src = url;
			highlight(btn);

			try {
				const res = await fetchRequest(
					`/avatar`,          // <-- note le "/" au début
					"PUT",
					{},
					{ avatar_url: url }
				);

				// Si ton fetchRequest THROW sur !res.ok, le code suivant ne sera pas exécuté
				if (res.error) {
					console.error("Server error:", res.status, await res.text());
					return;
				}
				user.avatar_url = res.payload.avatar_url;
				profile.url_avatar = res.payload.avatar_url;
				
				highlight(btn);
				selected = btn;
			} catch (err) {
				console.error("change avatar update failed:", err);
			}
		});
	});
}




export function update_name(): void
{
	const button = document.getElementById("ChangeName") as HTMLButtonElement | null;
	if (!button) return;
	
	button.addEventListener("click", async(event) =>{
		event.preventDefault();
		const changename = ((document.getElementById("change_name_input") as HTMLInputElement).value.trim());
		try{
			const res = await fetchRequest(
					`submit`,
					'POST',
					{},
					{ name: changename}

			);
			if (res.status === 409) {
				//wait the message error
				const err = await res.json().catch(() => ({}));
				console.warn("change name conflict:", err);
				return;
			}
			if (!res.ok) {
				console.error("Server error:", res.status, await res.text());
				return;
			}
			const data = await res.json();
			console.log("✅ change name update:", data);
			window.location.reload();
		}
		catch (err)
		{
			console.error("❌ change name update failed:", err);
		}
	})

}