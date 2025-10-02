import { navigateTo } from "../utils";
import { MatchView } from "../views";
import { button } from "./button";

export function menu() {
    const divElement = document.createElement("div");
    divElement.id = "menu-bar";
    divElement.className = "flex justify-start gap-2 p-1";
    button(divElement, "MATCH", () => {
        navigateTo("/match", MatchView);
    });
    button(divElement, "TOURNAMENT", () => {});
    return divElement;
}