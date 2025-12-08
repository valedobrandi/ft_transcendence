import { profile } from "../app";
import { stateProxyHandler, onMessageChange, type FriendListType, type ServerUsersList } from "../states/stateProxyHandler";
import { fetchRequest } from "../utils";

export type ListType = "FRIENDS" | "SERVER";

export function LiveStatusIndicator(isOnline: boolean): HTMLSpanElement {
    const statusSpan = document.createElement("span");
    statusSpan.className = "text-[8px] p-2";
    statusSpan.textContent = isOnline ? "🟢" : "🔴";
    return statusSpan;
}

export function List(
    users: (ServerUsersList | FriendListType)[],
    type: ListType
): HTMLDivElement {
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list-container";
    usersDiv.className = "overflow-y-auto";

    usersDiv.innerHTML = "";

    // FilterOut friends form server users
    if (type === "SERVER") {
        users = users.filter((user) =>
                !stateProxyHandler.friendList.find((friend) => friend.id === user.id)
        );
    }

    users.forEach((user) => {
        // Get name form serverUsers
        if (user.id === profile.id) {
            return; // Skip current user
        }
        const serverUSer = stateProxyHandler.serverUsers.find((u) => u.id === user.id);
        const name = serverUSer ? serverUSer.name : "Unknown";
        const btn = document.createElement("button");
        var userLiveStatus: HTMLSpanElement = document.createElement("span");
        if (type === "FRIENDS" && 'isConnected' in user) {
            userLiveStatus = LiveStatusIndicator(user.isConnected);
            btn.appendChild(userLiveStatus);
        }

        const btnText = document.createElement("span");
        btnText.textContent = ` ${name}`;
        btn.appendChild(btnText);

        btn.className = `${name} flex items-center border-b
                border-[#424549] p-2 w-full text-center text-white hover:bg-[#36393e]`;
        btn.id = `select-chat-btn`;

        btn.value = `${name}`;
        btn.name = `${user.id}`;

        usersDiv.appendChild(btn);
    });
    // Add bg-gray-100 to the selected chat button
    Array.from(
        document.getElementsByClassName(stateProxyHandler.selectChat.name)
    ).forEach((elem) => {
        elem.classList.add("bg-[#1e2124]");
    });

    return usersDiv;
}

export function UsersList(): HTMLDivElement {
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list";
    usersDiv.className = "border border-[#1e2124] w-full h-full flex flex-col bg-[#282b30]";

    function render() {
        usersDiv.innerHTML = "";

        // User Upper Half
        const upperDiv = document.createElement("div");
        upperDiv.className = "h-1/2 w-full overflow-y-auto flex flex-col ";

        const userListTitle = document.createElement("h2");
        userListTitle.textContent = "USERS LIST";
        userListTitle.className = "text-center text-white border-5 border-[#424549]";

        upperDiv.appendChild(userListTitle);
        upperDiv.appendChild(List(stateProxyHandler.serverUsers, "SERVER"));

        // Friend Lower Half
        const lowerDiv = document.createElement("div");
        lowerDiv.className = "h-1/2 w-full overflow-y-auto flex flex-col";

        const friendListTitle = document.createElement("h2");
        friendListTitle.textContent = "FRIENDS LIST";
        friendListTitle.className = "text-center text-white border-5 border-[#424549]";

        lowerDiv.appendChild(friendListTitle);
        lowerDiv.appendChild(List(stateProxyHandler.friendList, "FRIENDS"));

        usersDiv.appendChild(upperDiv);
        usersDiv.appendChild(lowerDiv);
    }
    render();
    onMessageChange(render);
    return usersDiv;
}

export function selectChatByButton(button: HTMLButtonElement) {
    const chatName = button.value;
    const chatId = button.name;
    console.log("Selected chat:", chatName, chatId);

    stateProxyHandler.selectChat = { name: chatName, id: Number(chatId) };
}


export async function onClickGetProfileData() {
    const [getProfile, getMatchHistory] = await Promise.all([
			fetchRequest(
				`/profile/user?id=${stateProxyHandler.selectChat.id}`,
				"GET"
			),
			fetchRequest(
				`/match/history?username=${stateProxyHandler.selectChat.name}`,
				"GET"
			),
		]);

		if (getProfile.message === "success") {
			stateProxyHandler.profile = getProfile.data;
		}

		if (getMatchHistory.message === "success") {
			stateProxyHandler.matchesHistory = getMatchHistory.data;
		}
}