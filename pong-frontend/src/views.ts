import { Intra } from "./components/Intra";
import { Default } from "./components/PageDefault";
import { RenderGame } from "./components/RenderGame";
import { Register } from "./components/FormRegister";
import { FormLogin } from "./components/FormLogin";
import { FormTwoFactorAuthentication } from "./components/FormTwoFactorAuthentication";
import { ProfilePage } from "./components/FormProfile";
import { websocketConnect } from "./websocket/websocketConnect";
import { FormGuest } from "./components/FormGuest";
import { endpoint } from "./endPoints";
import { initSocket } from "./websocket";
import { profile } from "./app";
import { IntraContainer } from "./components/IntraContainer";
import { stateProxyHandler } from "./states/stateProxyHandler";
import { SettignsContainer } from "./components/SettignsContainer";


// <!-- OLD INTRA VIEW -->

// export function intraView(root: HTMLElement) {
// 	initSocket(endpoint.pong_backend_websocket, profile.username);
// 	websocketConnect();
// 	root.innerHTML = "";

// 	const intraUI = Intra();
// 	const menuUI = Menu();
// 	root.appendChild(menuUI);
// 	root.appendChild(intraUI);
// 	stateProxyHandler.selectChat = { id: -1, name: 'Bienvenue dans le chat !' };
// }

// <!-- BERNARDO START EDIT -->
export function intraView(root: HTMLElement) {
  initSocket(endpoint.pong_backend_websocket, profile.username);
  websocketConnect();
  root.innerHTML = "";
  stateProxyHandler.selectChat = {id: profile.id, name: profile.username}

  // Main Intra Container
  const intraContainerUI = IntraContainer()

  root.appendChild(intraContainerUI);
  //root.appendChild(Menu());
  root.appendChild(SettignsContainer());
  // Chat View
  intraContainerUI.appendChild(Intra());
  // Profile View
  // intraContainerUI.appendChild(ProfileContainer());
  // Game View
  // intraContainerUI.appendChild(GameContainerUI());
}
// <!-- BERNARDO END EDIT -->

export function matchView(root: HTMLElement) {
  root.innerHTML = "";
  const container = document.createElement("div");
  container.className =
    "flex justify-center items-center h-full w-full overflow-hidden";
  const pongUI = RenderGame();
  container.appendChild(pongUI);
  root.appendChild(container);
}

export function defaultView(root: HTMLElement) {
  root.innerHTML = "";
  const loginUI = Default();
  //root.appendChild(SettignsContainer());
  root.appendChild(loginUI);
}

export function guestView(root: HTMLElement) {
  root.innerHTML = "";
  const guestUI = FormGuest();
  root.appendChild(guestUI);
  const enterBtn = document.getElementById("enter-button") as HTMLButtonElement;
  if (profile.username !== "") {
    enterBtn.setAttribute("disabled", "true");
    enterBtn.className += " opacity-20 cursor-not-allowed";
    enterBtn.className = enterBtn.className.replace(
      "cursor-pointer",
      "cursor-not-allowed"
    );
  }
}

export function loginView(root: HTMLElement) {
  root.innerHTML = "";
  const SingUI = FormLogin();
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

export function profileView(root: HTMLElement) {
  root.innerHTML = "";
  const profileUI = ProfilePage();
  root.appendChild(profileUI);
}
