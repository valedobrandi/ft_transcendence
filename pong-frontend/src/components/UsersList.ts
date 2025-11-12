import { messageState, onMessageChange, type FriendListType, type ServerUsersList } from "../states/messageState";
import { id as userId } from "../app";


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

    function render() {
        usersDiv.innerHTML = "";

        // FilterOut friends form server users
        if (type === "SERVER") {
            users = users.filter((user) =>
                    !messageState.friendList.find((friend) => friend.id === user.id)
            );
        }

        users.forEach((user) => {
            if (Number(userId.id) === Number(user.id)) return;
			// Get name form serverUsers
			const serverUSer = messageState.serverUsers.find((u) => u.id === user.id);
			const name = serverUSer ? serverUSer.name : "Unknown";
            const btn = document.createElement("button");
			var userLiveStatus: HTMLSpanElement = document.createElement("span");
			if (type === "FRIENDS") {
				userLiveStatus = LiveStatusIndicator(user.isConnected);
				btn.appendChild(userLiveStatus);
			}

            const btnText = document.createElement("span");
            btnText.textContent = ` ${name}`;
            btn.appendChild(btnText);

            btn.className = `${name} flex items-center border-b
                border-gray-300 p-2 w-full text-center hover:bg-gray-100`;
            btn.id = `select-chat-btn`;

            btn.value = `${name}`;
            btn.name = `${user.id}`;
			
            usersDiv.appendChild(btn);
        });
        // Add bg-gray-100 to the selected chat button
        Array.from(
            document.getElementsByClassName(messageState.selectChat.name)
        ).forEach((elem) => {
            elem.classList.add("bg-gray-100");
        });
    }
    render();
    return usersDiv;
}

export function UsersList(): HTMLDivElement {
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list";
    usersDiv.className = "border w-xs";

    function render() {
        usersDiv.innerHTML = "";

        const usersListUI = List(messageState.serverUsers, "SERVER");
        usersDiv.appendChild(usersListUI);

        const friendListTitle = document.createElement("h2");
        friendListTitle.textContent = "FRIENDS LIST";
        friendListTitle.className =
            "text-center text-blue-900 border-blue-900 border";

        const friendListUI = List(
            messageState.friendList,
            "FRIENDS"
        );

        usersDiv.appendChild(friendListTitle);
        usersDiv.appendChild(friendListUI);
    }
    render();
    onMessageChange(render);
    return usersDiv;
}

export function selectChatByButton(button: HTMLButtonElement) {
    const chatName = button.value;
    const chatId = button.name;
    console.log("Selected chat:", chatName, chatId);

    messageState.selectChat = { name: chatName, id: Number(chatId) };
}
