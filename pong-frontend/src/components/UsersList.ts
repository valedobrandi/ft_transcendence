import { users } from "../../mock/users";

export function UsersList(): HTMLDivElement {
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list-container";
    usersDiv.className = "";

    users.forEach(({alias}) => {
        const elementP = document.createElement("p");
        elementP.textContent = `#${alias}`;
        elementP.className = "flex justify-between items-center border-b border-gray-300 underline p-2";
        usersDiv.appendChild(elementP);

        const selectElement = document.createElement("select");
        selectElement.className = "bg-gray-200 text-xs rounded text-center px-1";
        const optionDefault = document.createElement("option");
        optionDefault.value = "select-action";
        optionDefault.textContent = "Action";
        optionDefault.selected = true;
        optionDefault.disabled = true;
        const option1 = document.createElement("option");
        option1.value = "send-message";
        option1.textContent = "Send Message";
        const option2 = document.createElement("option");
        option2.value = "view-profile";
        option2.textContent = "View Profile";
        const option3 = document.createElement("option");
        option3.value = "add-friend";
        option3.textContent = "Add Friend";
        const option4 = document.createElement("option");
        option4.value = "block-user";
        option4.textContent = "Block User";
        const option5 = document.createElement("option");
        option5.value = "invite-user";
        option5.textContent = "Invite to Game";
        selectElement.appendChild(optionDefault);
        selectElement.appendChild(option1);
        selectElement.appendChild(option2);
        selectElement.appendChild(option3);
        selectElement.appendChild(option4);
        selectElement.appendChild(option5);
        elementP.appendChild(selectElement);
    });

    return usersDiv;
}