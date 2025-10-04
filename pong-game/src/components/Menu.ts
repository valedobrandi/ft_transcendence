import { navigateTo } from "../utils";
import { matchView } from "../views";
import { Button } from "./Button";

export function Menu() {
    const divElement = document.createElement("div");
    divElement.id = "menu-bar";
    divElement.className = "flex justify-start gap-2 p-1";
    const matchBtn = Button("MATCH", "w-24", () => {
            navigateTo("/match", matchView);
        });
    const tourBtn = Button("TOURNAMENT", "w-24", () => {});
    divElement.appendChild(matchBtn);
    divElement.appendChild(tourBtn);
    return divElement;
}