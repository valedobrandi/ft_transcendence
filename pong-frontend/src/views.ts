import { Intra } from "./components/Intra";
import { Default } from "./components/PageDefault";
import { RenderGame } from "./components/RenderGame";
import { Register } from "./components/FormRegister";
import { FormLogin } from "./components/FormLogin";
import { FormTwoFactorAuthentication } from "./components/FormTwoFactorAuthentication";
import { ProfilePage } from "./components/FormProfile";
import { jwt, profile } from "./app";
import { IntraContainer } from "./components/IntraContainer";
import { stateProxyHandler } from "./states/stateProxyHandler";
import { GameStateContainer } from "./components/GameStateContainer";
import { fetchRequest, navigateTo } from "./utils";
import { FriendInvite } from "./components/FriendInvite";
import { TournamentIntra } from "./components/TournamentIntra";


export async function intraView(root: HTMLElement) {
  root.innerHTML = "";
  stateProxyHandler.chat = { id: profile.id, name: profile.username }
  const response = await fetchRequest("/server/state", "GET");
  if (response.message === 'success') {
    stateProxyHandler.settings = { state: response.data}
  }

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
    "flex flex-1 min-w-0";
  container.style.backgroundImage = "url('/default_background.jpg')";
  container.id = "match-container";

  // header bar
  const rightBar = document.createElement("div");
  rightBar.className = "flex p-6 no-wrap "

  const leftBar = document.createElement("div");
  leftBar.className = "flex flex-col p-6 gap-4 shrink-0 w-fit";



  // back button
  const backBtn = document.createElement("button");
  backBtn.className = "border border-black bg-black p-4 text-white rounded-lg hover:bg-red-500 hover:border-red-500 hover:cursor-pointer";
  backBtn.onclick = () => {
    navigateTo("/intra");
  };

  const back = document.createElement("p");
  back.innerHTML = "&#x21a9;";
  back.className = "text-white text-7xl font-bold";
  backBtn.appendChild(back);
  // Tournament Intra Messages

  rightBar.appendChild(backBtn);
  container.appendChild(rightBar);

  rightBar.appendChild(TournamentIntra());

  container.appendChild(RenderGame());
  container.appendChild(leftBar)
  
  root.appendChild(container);
}

export function defaultView(root: HTMLElement) {
  root.innerHTML = "";
  root.appendChild(Default());
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
