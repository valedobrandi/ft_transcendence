import { profile, jwt } from "../app";
import { fetchRequest, navigateTo } from "../utils";

export function ChatHeader(): HTMLDivElement {

    const chatMenu = document.createElement("div");
    chatMenu.id = "chat-menu";
    chatMenu.className = "flex border-b bg-gray-100 h-10";


    const options = [
        { value: "view-profile", text: "View Profile" },
        { value: "add-friend", text: "Add Friend" },
        { value: "block-user", text: "Block User" },
        { value: "invite-user", text: "Invite to Game" }
    ]

	options.forEach(opt => {
		const btn = document.createElement("button");
		btn.className = `px-4 py-2 bg-gray-200 hover:bg-gray-300
            text-xs min-w-32 rounded cursor-pointer focus:outline-none`;
		btn.id = `btn-${opt.value}`;
		btn.value = opt.value;
		btn.textContent = opt.text;


		if (opt.value === "view-profile") {
			btn.onclick = profileOnclick;
		}

		chatMenu.appendChild(btn);
	});
	return chatMenu;
}

const profileOnclick = async () => {

	console.log("(opt.value === view-profile")
	try {
		const data = await fetchRequest('/profile', 'GET',
			{});

		if (data.message === 'success') {
			profile.username = data.user.username;
			profile.id = data.user.id;
			profile.email = data.user.email;
			console.log("PROFIL = ", profile.username);

			navigateTo("/profile");
		}
		else {
			console.error("Erreur lors du chargement du profil :", data);
		}
	}
	catch (err) {
		console.error("Erreur réseau :", err);
	}

}