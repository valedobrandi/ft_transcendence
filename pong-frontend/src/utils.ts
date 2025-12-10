import { profile, jwt } from "./app";
import { CreateAlert } from "./components/CreateAlert";
import { endpoint } from "./endPoints";
import { guestView, intraView, loginView, matchView, registerView, defaultView, twoFactorAuthenticationView, profileView } from "./views";

export function navigateTo(path: string) {
    history.pushState({}, "", path);
    renderRoute(path);
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

 export function renderRoute(path: string) {
    const protectedRoutes = ["/match", "/intra", "/profile"];

    //console.log(`username: ${profile.username}`);
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

// export async function fetchRequest(
//     path: string,
// 	method: string,
//     headers: Record<string, string>,
//     options: Record<string, string> = {}) {

//     const url = `${endpoint.pong_backend_api}${path}`;
//     const defaultHeaders = {
//         'Content-Type': 'application/json',
//         // Add auth token
//         //'Authorization': `Bearer ${token}`,
//     };

//     try {
//         const response = await fetch(url, {
//             method: method,
//             headers: { ...defaultHeaders, ...headers },
//             ...options,
//         });

//         if (!response.ok) {
//             const error = await response.json();
//             throw new Error(error.message || 'API error');
//         }

//         return await response.json();
//     } catch (err) {
//         console.error(`Fetch error on ${endpoint}:`, err);
//         throw err;
//     }
// }

// export async function fetchRequest
// (
// export async function fetchRequest(
//     path: string,
// 	method: string,
//     headers: Record<string, string>,
//     options: Record<string, string> = {}) {

//     const url = `${endpoint.pong_backend_api}${path}`;
//     const defaultHeaders = {
//         'Content-Type': 'application/json',
//         // Add auth token
//         //'Authorization': `Bearer ${token}`,
//     };

//     try {
//         const response = await fetch(url, {
//             method: method,
//             headers: { ...defaultHeaders, ...headers },
//             ...options,
//         });

//         if (!response.ok) {
//             const error = await response.json();
//             throw new Error(error.message || 'API error');
//         }

//         return await response.json();
//     } catch (err) {
//         console.error(`Fetch error on ${endpoint}:`, err);
//         throw err;
//     }
// }

export async function fetchRequest
    (
        path: string,
        method: string,
        headers: Record<string, string> = {},
        options: RequestInit = {}) {

    const url = `${endpoint.pong_backend_api}${path}`;
    //console.log(`[REQUEST] ${method} ${url} response:`,JSON.stringify(options));
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
            const error = await response.json();
            //console.log("DATA FROM BACKEND:", error);
            throw new Error(error.message || 'API error');
        }

        if ('accessToken' in response) jwt.token = response.accessToken as string;
        const data = await response.json();
        //console.log(`[RESPONSE] ${method} ${url} response:`, data);
        return data;
    }
    catch (err) {
        console.error(`Fetch error on ${url}:`, err);
        throw err;
    }
}


export async function toggle2FA(): Promise<void> {
    try {


        const new2FAValue = profile.twoFA_enabled === 1 ? 0 : 1;
        //console.log('NEWVALEUR= ', new2FAValue);

        const response = await fetchRequest("/updata/2FA", "PUT", {}, {
            body: JSON.stringify({ twoFA_enabled: profile.twoFA_enabled ? 0 : 1 })
        });


        if (response.message === "success") {
            profile.twoFA_enabled = response.payload.twoFA_enabled;

            const twoFABtn = document.getElementById("toggle_2fa") as HTMLButtonElement;
            if (twoFABtn) {
                twoFABtn.textContent = new2FAValue === 1 ? "Disable 2FA" : "Enable 2FA";
            }

            //alert(`2FA has been ${new2FAValue === 1 ? "enabled" : "disabled"} successfully`);
        } else {
            alert("Failed to update 2FA: " + (response.error || "Unknown error"));
        }
    } catch (err) {

        console.error("Error toggling 2FA:", err);
        alert("Error toggling 2FA");
    }
}

export function createElement(type: string, id:string, className:string[]): HTMLElement {
    const element = document.createElement(type);
    element.id = id;
    element.classList.add(...className);
    return element;
}