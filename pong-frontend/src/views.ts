import { Intra } from "./components/Intra";
import { Default } from "./components/PageDefault";
import { RenderGame } from "./components/RenderGame";
import { Register } from "./components/FormRegister";
import { FormLogin } from "./components/FormLogin";
import { FormTwoFactorAuthentication } from "./components/FormTwoFactorAuthentication";
import { ProfilePage } from "./components/FormProfile";
import { FormGuest } from "./components/FormGuest";
import { jwt, profile } from "./app";
import { IntraContainer } from "./components/IntraContainer";
import { stateProxyHandler } from "./states/stateProxyHandler";
import { GameStateContainer } from "./components/GameStateContainer";
import { navigateTo } from "./utils";
import { FriendInvite } from "./components/FriendInvite";


export function intraView(root: HTMLElement) {
  root.innerHTML = "";
  stateProxyHandler.chat = {id: profile.id, name: profile.username}

  // Main Intra Container
  const intraContainerUI = IntraContainer()
  intraContainerUI.appendChild(FriendInvite());
  root.appendChild(intraContainerUI);
  root.appendChild(GameStateContainer());
  intraContainerUI.appendChild(Intra());
}


export function matchView(root: HTMLElement) {
  root.innerHTML = "";

  // main container
  const container = document.createElement("div");
  container.className =
    "flex flex-col h-full w-full overflow-hidden";
  container.style.backgroundImage = "url('/default_background.jpg')";
  container.id = "match-container";

  // header bar
  const headerBar = document.createElement("div");
  headerBar.className = "flex justify-center w-full no-wrap"

  // back button
  const backBtn = document.createElement("button");
  backBtn.className = "border border-black bg-black text-white text-2xl p-4 mt-4 rounded-lg hover:bg-red-500 hover:border-red-500 hover:cursor-pointer";
  backBtn.innerText = "QUIT MATCH";
  backBtn.onclick = () => {
    navigateTo("/intra");
  };
  
  headerBar.appendChild(backBtn);
  container.appendChild(headerBar);
  container.appendChild(RenderGame());
  root.appendChild(container);
}

export function defaultView(root: HTMLElement) {
  root.innerHTML = "";
  root.appendChild(Default());
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
  if (profile.username !== "" && jwt) {
    navigateTo("/intra");
  }
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
