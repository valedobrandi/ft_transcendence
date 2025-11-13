import { Button } from "./Button";
import { HeaderBar } from "./HeaderBar";
import { InputName } from "./InputName";
import { InputPassword } from "./InputPassword";
import { fetchRequest, navigateTo } from "../utils";
import { id, jwt } from "../app";
import { addIntraMessage, stateProxyHandler } from "../states/stateProxyHandler";

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

            const [friendsList, blockedList] = await Promise.all([
                fetchRequest('/friends-list', 'GET', {}),
                fetchRequest('/block-list', 'GET', {})
            ]);

            if (friendsList.message === 'success') {
                const newFriendList = friendsList.payload.map((friend: any) => ({
                    id: friend.id,
                    isConnected: friend.isConnected,
                }));
                stateProxyHandler.friendList = newFriendList;
                console.log("[FRIEND LIST ON LOGIN]", stateProxyHandler.friendList);
            }
            if (blockedList.message === 'success') {
                stateProxyHandler.chatBlockList = blockedList.payload;
            }
            navigateTo("/intra");
        }
    };

    return viewDiv;
}

