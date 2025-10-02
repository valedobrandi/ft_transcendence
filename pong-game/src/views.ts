import { intra } from "./components/intra";
import { menu } from "./components/menu";
import { pong } from "./components/pong";
import { settings } from "./components/settings";

export function IntraView(root: HTMLElement) {
    root.innerHTML = "";
    const intraUI = intra();
    const menuUI = menu();
    root.appendChild(menuUI);
    root.appendChild(intraUI);
}

export function MatchView(root: HTMLElement) {
    root.innerHTML = "";
    const pongUI = pong();
    root.appendChild(pongUI);
}