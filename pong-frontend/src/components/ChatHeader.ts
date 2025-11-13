import { stateProxyHandler, onStateChange } from "../states/stateProxyHandler";

export function ChatHeader(): HTMLDivElement {

    const chatMenu = document.createElement("div");
    chatMenu.id = "chat-menu";
    chatMenu.className = "flex border-b bg-gray-100 h-10 shrink-0";
    chatMenu.classList.add("justify-between");

    function onRender() {
        chatMenu.innerHTML = ""
        const options = [
            { value: "view-profile", text: "View Profile" },
            { value: "friend-list", text: "add to friend list" },
            { value: "block-user", text: "Block User" },
            { value: "invite-user", text: "Invite to Game" }
        ]

        options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = `px-4 py-2 bg-gray-200 hover:bg-gray-300 uppercase font-semibold
            shrink-0 text-xs min-w-32 rounded cursor-pointer focus:outline-none`;
            btn.id = `btn-${opt.value}`;
            btn.value = opt.value;
            btn.textContent = opt.text;
            const { selectChat, chatBlockList } = stateProxyHandler;
            if (opt.value === "block-user") {
                setButtonToUnblockState(btn);
                if (chatBlockList.includes(selectChat.id)) {
                    setButtonToBlockState(btn);
                }
            }
            chatMenu.appendChild(btn);
        })
    }
    onRender();
    onStateChange("chatBlockList", onRender);
    onStateChange("selectChat", onRender);
    return chatMenu;
}

export function setButtonToBlockState(button: HTMLButtonElement) {
    button.setAttribute("id", "btn-unblock-user");
    button.classList.add("text-red-500");
    button.textContent = "UNBLOCK USER";
}

export function setButtonToUnblockState(button: HTMLButtonElement) {
    button.setAttribute("id", "btn-block-user");
    button.classList.remove("text-red-500");
    button.textContent = "BLOCK USER";
}
