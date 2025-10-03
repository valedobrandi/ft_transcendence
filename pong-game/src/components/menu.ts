import { navigateTo } from "../utils";
import { MatchView } from "../views";
import { Button } from "./Button";

export function menu() {
    const divElement = document.createElement("div");
    divElement.id = "menu-bar";
    divElement.className = "flex justify-start gap-2 p-1";
    Button(divElement, "MATCH", () => {
        navigateTo("/match", MatchView);
    });
    Button(divElement, "TOURNAMENT", () => {});
    return divElement;
}