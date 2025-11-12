import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";
import { fetchRequest, navigateTo } from "../utils";
import { id, jwt } from "../app";
import { addIntraMessage, messageState } from "../states/messageState";

export function FormLogin(): HTMLElement {
    const viewDiv = document.createElement("div");
    viewDiv.className = "flex flex-col h-screen";

    const headerBar = HeaderBar("LOGIN");

    const formElement = document.createElement("form");
    formElement.className = "flex flex-col justify-center items-center flex-grow gap-2 maw-w-sm mx-auto";

    const inputPasswordUI = InputPassword();
    const inputNameUI = InputName();

    const sendBtn = Button("login", "w-full", () => { });

    viewDiv.appendChild(headerBar);
    viewDiv.appendChild(formElement);
    formElement.appendChild(inputNameUI);
    formElement.appendChild(inputPasswordUI);
    formElement.appendChild(sendBtn);

    formElement.onsubmit = async (e) => {
        e.preventDefault();

        const username_input = document.getElementById('register_username') as HTMLInputElement;
        const password_input = document.getElementById('register_password') as HTMLInputElement;
        if (username_input === null || password_input === null) return;

        const username = username_input.value.trim();
        const password = password_input.value.trim();

        const response = await fetchRequest(
            `/login`,
            'POST',
            {},
            { body: JSON.stringify({ username, password }) }
        );

        if (response.message === 'success') {
            jwt.token = response.payload.accessToken;
            id.username = response.payload.username;
            id.id = response.payload.id;
            const [friendsList, pendingEvents] = await Promise.all([
                fetchRequest('/friends-list', 'GET', {}),
                fetchRequest('/to-events', 'GET')
            ]);
            if (friendsList.message === 'success') {
                messageState.friendList = friendsList.payload;
            }
            if (pendingEvents.message === 'success') {
                const { payload } = pendingEvents.json();
                switch (pendingEvents.payload.type) {
                    case 'friend:add':
                        const getSender = messageState.serverUsers
                            .find(({ id }) => Number(id) === Number(payload.id))
                        addIntraMessage(`${getSender} has send a friend request ${btnLink(getSender)}`)
                        break;
                    default:
                        break;
                }
            }
            navigateTo("/intra");
        }
    };

    return viewDiv;
}

function btnLink(friend: number): string {
    return (
        `<button id="accept-friend-request name=${friend}"> YES <\button>`
    )
}