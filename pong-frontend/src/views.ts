import { Intra } from "./components/Intra";
import { Login } from "./components/Login";
import { Menu } from "./components/Menu";
import { RenderGame } from "./components/RenderGame";
import { Register } from "./components/FormRegister";
import { FormSingIn } from "./components/FormSingIn";
import { FormTwoFactorAuthentication } from "./components/FormTwoFactorAuthentication";
import { websocketConnect } from "./websocket/connect";
import { messagerState, renderMessages } from "./states/messagerState";

export function intraView(root: HTMLElement) {
    root.innerHTML = "";
    const intraUI = Intra();
    const menuUI = Menu();
    root.appendChild(menuUI);
    root.appendChild(intraUI);
    websocketConnect();
    const tabBar = document.getElementById('chat-tabs');
    if (!tabBar) return;

    tabBar.innerHTML = '';

    let intraTab: HTMLButtonElement | null = null;
    for (const chatId of messagerState.messages.keys()) {
        const tab = document.createElement('button');
        tab.textContent = `#${chatId}`;
        tab.className = 'px-4 text-sm border-r border-gray-300 bg-white cursor-pointer hover:bg-blue-100';
        tab.onclick = () => {
            renderMessages(chatId);
        };
        if (chatId === "INTRA") {
            intraTab = tab;
        }
        tabBar.appendChild(tab);
    }
    if (intraTab) intraTab.click();
}

export function matchView(root: HTMLElement) {
    root.innerHTML = "";

    const container = document.createElement("div");
    container.className = "flex justify-center items-center h-full w-full overflow-hidden"
    const pongUI = RenderGame();
    container.appendChild(pongUI);
    root.appendChild(container);
}

export function loginView(root: HTMLElement) {
    root.innerHTML = "";
    const loginUI = Login();
    root.appendChild(loginUI);
}

export function singInView(root: HTMLElement) {
    root.innerHTML = "";
    const SingUI = FormSingIn();
    root.appendChild(SingUI);
}

export function registerView(root: HTMLElement) {
    root.innerHTML = "";
    const registerUI = Register();
    root.appendChild(registerUI);
}

export function twoFactorAuthenticationView(root: HTMLElement) {
    root.innerHTML = "";
    const authenticationUI = FormTwoFactorAuthentication();
    root.appendChild(authenticationUI);
}