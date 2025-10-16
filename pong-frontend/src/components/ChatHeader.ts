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
        btn.className = `px-4 py-2 flex-shink-0 hover:bg-gray-200 text-xs focus:outline-none`;
        btn.value = opt.value;
        btn.textContent = opt.text;
        chatMenu.appendChild(btn);
    })

    return chatMenu;
}