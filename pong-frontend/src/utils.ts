import { profile, jwt } from "./app";
import { CreateAlert } from "./components/CreateAlert";
import { QRCodeModal } from "./components/QRCodeModal";
import { endpoint } from "./endPoints";
import { getStorageStates, removeLocalStorage, stateProxyHandler } from "./states/stateProxyHandler";
import { guestView, intraView, loginView, matchView, registerView, defaultView, twoFactorAuthenticationView, profileView } from "./views";
import { initSocket } from "./websocket";
import { websocketConnect } from "./websocket/websocketConnect";
import { websocketNewEvents } from "./websocket/websocketNewEvents";

export async function navigateTo(path: string) {
    history.pushState({}, "", path);
    await renderRoute(path);
}

const routes: Record<string, (root: HTMLElement) => void> = {
    "/match": matchView,
    "/intra": intraView,
    "/": defaultView,
    "/login": loginView,
    "/register": registerView,
    "/guest": guestView,
    "/auth": twoFactorAuthenticationView,
    "/profile": profileView
};

async function userSession() {
    if (jwt.token) { return; }

    const jwt_token = localStorage.getItem('jwt_token');
    if (!jwt_token) { return; }

    jwt.token = jwt_token;

    const response = await fetchRequest("/authenticate", "GET", {});
    if (response.message === "error") {
        jwt.token = undefined;
        removeLocalStorage();
        return navigateTo("/");
    }

    if (response.message === "success") {
        profile.username = response.data.username;
        profile.id = response.data.id;
    }
    
    getStorageStates();

    initSocket();
    websocketConnect();
    await websocketNewEvents();

    
    const [friendList, chatBlockList, userProfile, matchesHistory, serverUsers] = await Promise.all([
        fetchRequest('/friends-list', 'GET', {}),
        fetchRequest('/block-list', 'GET', {}),
        fetchRequest(`/profile/user?id=${stateProxyHandler.chat.id}`, "GET"),
        fetchRequest(`/match/history?username=${stateProxyHandler.chat.name}`, "GET"),
        fetchRequest("/server/register", "GET", {}),
        fetchRequest("/server/state", "GET", {})
    ]);

    if (friendList.message === 'success') {
        stateProxyHandler.friendList = friendList.payload;
    }
    if (chatBlockList.message === 'success') {
        stateProxyHandler.chatBlockList = chatBlockList.payload;
    }
    if (userProfile.message === "success") {
        stateProxyHandler.profile = userProfile.data;
    }
    if (matchesHistory.message === "success") {
        stateProxyHandler.matchesHistory = matchesHistory.data;
    }
    if (serverUsers.message === "success") {
        stateProxyHandler.serverUsers = serverUsers.data;
    }

}

export async function renderRoute(path: string) {
    const sessionRoutes = ["/login", "/match", "/intra", "/profile"];
    
    if (sessionRoutes.includes(path)) {
        await userSession();
    }

    const protectedRoutes = ["/match", "/intra", "/profile"];

    const root = document.getElementById("root")!;
    const view = routes[path] || defaultView;

    if (protectedRoutes.includes(path) && profile.username === "") {
        navigateTo("/");
        const alertBox = CreateAlert("You must be logged in to access this page.", "error");
        const viewContainer = document.getElementById("view-container");
        if (viewContainer) {
            viewContainer.prepend(alertBox);
        }
        return;
    }
    view(root);
}

export function setTime(ms: number, func: () => void): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => { func(); resolve(); }, ms);
    });
}

export async function fetchRequest
    (
        path: string,
        method: string,
        headers: Record<string, string> = {},
        options: RequestInit = {}) {

    const url = `${endpoint.pong_backend_api}${path}`;
    console.log(`[REQUEST] ${method} ${url} response:`, JSON.stringify(options));
    const defaultHeaders: Record<string, string> = {
        // Add auth token
        'Authorization': `Bearer ${jwt.token}`,
    };
    if (method === 'POST' || method === 'PUT') {
        defaultHeaders['Content-Type'] = 'application/json';
    }
    try {

        const response = await fetch(url, {
            method: method,
            headers: { ...defaultHeaders, ...headers },
            ...options,
        });

        if (!response.ok) {
            return response;
        }


        if ('accessToken' in response) jwt.token = response.accessToken as string;
        try {
            const data = await response.json();
            console.log(`[RESPONSE] ${method} ${url} response:`, data);
            return data;
        }
        catch {
            return response;
        }
    }
    catch (err) {
        console.error(`[FETCH ERROR] ${url}:`, err);
        throw err;
    }
}


export async function toggle2FA(): Promise<void> {
    try {


        const new2FAValue = profile.twoFA_enabled === 1 ? 0 : 1;
        console.log('NEWVALEUR= ', new2FAValue);

        const response = await fetchRequest("/twoFA", "PUT", {}, {
            body: JSON.stringify({ twoFA_enabled: profile.twoFA_enabled ? 0 : 1 })
        });


        if (response.message === "success") {
            const qrCode = response.payload.qrCode;
            const twoFABtn = document.getElementById("toggle_2fa") as HTMLButtonElement;
            if (new2FAValue === 1 && qrCode) {
                window.document.body.appendChild(QRCodeModal(qrCode));    
            }
            profile.twoFA_enabled = response.payload.twoFA_enabled;
            
            if (twoFABtn) {
                twoFABtn.textContent = new2FAValue === 1 ? "Disable 2FA" : "Enable 2FA";
            }
        } else {
            alert("Failed to update 2FA: " + (response.error || "Unknown error"));
        }
    } catch (err) {

        console.error("Error toggling 2FA:", err);
        alert("Error toggling 2FA");
    }
}

export function createElement(type: string, id: string, className: string[]): HTMLElement {
    const element = document.createElement(type);
    element.id = id;
    element.classList.add(...className);
    return element;
}