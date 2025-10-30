import { messagerState, onMessagerChange } from "../states/messagerState";
import { id as userId }  from "../app";

export function UsersList(): HTMLDivElement {
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list-container";

    function render() {
        usersDiv.innerHTML = "";
        messagerState.connected.forEach(({ name, id }) => {

            if (userId.username === id) return;

             const btn = document.createElement("button");
            // Show the first 10 characters of the name
            btn.textContent = `${name.substring(0, 10)}`;
            btn.className = `flex justify-center items-center border-b 
                border-gray-300 p-2 w-full text-center hover:bg-gray-100`;
            btn.id = `chat-select-chat`;
            btn.value = `${id}`;
            
            usersDiv.appendChild(btn);

            /* const selectElement = document.createElement("select");
            selectElement.className = "bg-gray-200 text-xs rounded text-center px-1";
            selectElement.id = "user-actions";

            const options = [
                { value: "select-action", text: "", selected: true, disabled: true },
                { value: "send-message", text: "Send Message" },
                { value: "view-profile", text: "View Profile" },
                { value: "add-friend", text: "Add Friend" },
                { value: "block-user", text: "Block User" },
                { value: "invite-user", text: "Invite to Game" }
            ]

            options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt.value;
                option.textContent = opt.text;
                if (opt.selected) option.selected = true;
                if (opt.disabled) option.disabled = true;
                selectElement.appendChild(option);
                }) 
                
                elementP.appendChild(selectElement);*/

        });
    }

    render();
    onMessagerChange(render);
    return usersDiv;
}