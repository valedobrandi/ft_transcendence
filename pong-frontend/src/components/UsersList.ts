import { messagerState, onMessagerChange } from "../states/messagerState";
import { id as userId }  from "../app";

export function UsersList(): HTMLDivElement {
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list-container";

    function render() {
        usersDiv.innerHTML = "";
        messagerState.connected.forEach(({ name, id }) => {

            if (userId.username === name) return;

             const btn = document.createElement("button");
            // Show the first 10 characters of the name
            btn.textContent = `${name.substring(0, 10)}`;
            btn.className = `${name} flex justify-center items-center border-b
                border-gray-300 p-2 w-full text-center hover:bg-green-100`;
            btn.id = `chat-select-${name}`;
            console.log("Rendering user button for:", name, id);
            btn.value = `${name}`;
            btn.name = `${id}`;
            usersDiv.appendChild(btn);

        });
    }

    render();
    onMessagerChange(render);
    return usersDiv;
}


export function selectChatByButton(button: HTMLButtonElement) {
    const chatName = button.value;
    const chatId = button.name;
    console.log("Selected chat:", chatName, chatId);

    messagerState.selectChat = { name: chatName, id: Number(chatId) };
}