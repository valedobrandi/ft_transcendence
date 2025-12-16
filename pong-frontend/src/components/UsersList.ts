import { profile } from "../app";
import { stateProxyHandler, type FriendListType, type ServerUsersList, onStateChange } from "../states/stateProxyHandler";
import { fetchRequest } from "../utils";

export type ListType = "FRIENDS" | "SERVER";

export function LiveStatusIndicator(isOnline: boolean): HTMLSpanElement {
    const status = document.createElement("span");
    status.className = "text-base p-2 mr-2 font-bold border rounded-full";
    status.classList.add(isOnline ? "text-green-500" : "text-red-500");
    status.textContent = isOnline ? "ONLINE" : "OFFLINE";
    return status;
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

        const messages = stateProxyHandler.messages[user.id] || [];
        const unreadMessages = messages.filter((msg) => msg.isRead === 0 && msg.from !== profile.id);

        const isSelected = stateProxyHandler.chat.id === user.id;

        const serverUSer = stateProxyHandler.serverUsers.find((u) => u.id === user.id);
        const name = serverUSer ? serverUSer.name : "Unknown";

        const btn = document.createElement("button");
        btn.id = `select-chat-btn`;
        btn.value = `${name}`;
        btn.name = `${user.id}`;
        btn.className = `${name} flex items-center border-b text-2xl
                border-[#424549] p-2 w-full text-center text-white hover:bg-[#36393e]`;
        btn.classList.remove("bg-[#36393e]", "bg-[#282b30]");
        btn.classList.add(isSelected ? "bg-[#36393e]" : "bg-[#282b30]");

        var userLiveStatus: HTMLSpanElement = document.createElement("span");
        if (type === "FRIENDS" && 'isConnect' in user) {
            userLiveStatus = LiveStatusIndicator(user.isConnect);
            btn.appendChild(userLiveStatus);
        }

        const btnText = document.createElement("div");
        btnText.innerHTML = `<span>${name} </span>`;

        const newMessage = document.createElement("span");
        newMessage.className = "text-green-500 font-bold ml-2 text-base underline";
        if (unreadMessages.length > 0 && !isSelected) {
            newMessage.textContent = "New Message!";
        } else {
            newMessage.textContent = "";
        }
        btnText.appendChild(newMessage);

        btn.appendChild(btnText);

        usersDiv.appendChild(btn);
    });

    return usersDiv;
}

function reorder<T extends { id: number }>(list: T[]): T[] {
    // const selectedId = stateProxyHandler.chat.id;
    const newServerUsers = [...list].sort((a, b) => {
        const aUnread = (stateProxyHandler.messages[a.id] ?? [])
            .some(msg => msg.isRead === 0 && msg.from !== profile.id);
        const bUnread = (stateProxyHandler.messages[b.id] ?? [])
            .some(msg => msg.isRead === 0 && msg.from !== profile.id);

        if (aUnread === bUnread) return 0;
        return aUnread ? -1 : 1;
    });
    return newServerUsers;
}

export function UsersList(): HTMLDivElement {
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list";
    usersDiv.className = "border border-[#1e2124] w-full h-full flex flex-col bg-[#282b30]";

    function onRender() {
        usersDiv.innerHTML = "";

        // User Upper Half
        const upperDiv = document.createElement("div");
        upperDiv.className = "h-1/2 w-full overflow-y-auto flex flex-col ";

        const userListTitle = document.createElement("h2");
        userListTitle.textContent = "CHAT USERS";
        userListTitle.className = "text-center text-white border-5 border-[#424549]";

        // IF MESSAGES HAS UNREAD THEN INDEX 0
        const newServerUsers = reorder(stateProxyHandler.serverUsers);

        upperDiv.appendChild(userListTitle);
        upperDiv.appendChild(List(newServerUsers, "SERVER"));

        // Friend Lower Half
        const lowerDiv = document.createElement("div");
        lowerDiv.className = "h-1/2 w-full overflow-y-auto flex flex-col";

        const friendListTitle = document.createElement("h2");
        friendListTitle.textContent = "FRIENDS LIST";
        friendListTitle.className = "text-center text-white border-5 border-[#424549]";

        const newFriendList = reorder(stateProxyHandler.friendList);
        lowerDiv.appendChild(friendListTitle);
        lowerDiv.appendChild(List(newFriendList, "FRIENDS"));

        usersDiv.appendChild(upperDiv);
        usersDiv.appendChild(lowerDiv);
    }

    onRender();
    onStateChange("serverUsers", onRender);
    onStateChange("friendList", onRender);
    onStateChange("chat", onRender);
    onStateChange("messages", onRender);

    return usersDiv;
}

export function selectChatByButton(button: HTMLButtonElement) {
    const chatName = button.value;
    const chatId = button.name;
    console.log("Selected chat:", chatName, chatId);

    stateProxyHandler.chat = { name: chatName, id: Number(chatId) };
}


export async function onClickGetProfileData() {
    const [getProfile, getMatchHistory] = await Promise.all([
        fetchRequest(
            `/profile/user?id=${stateProxyHandler.chat.id}`,
            "GET"
        ),
        fetchRequest(
            `/match/history?username=${stateProxyHandler.chat.name}`,
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
