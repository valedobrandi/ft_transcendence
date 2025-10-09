import { serverState } from "../state";
// import { navigateTo } from "../utils";
// import { matchView } from "../views";
import { Button } from "./Button";
import { id, socket } from "../app";
const text = "name";
export function Menu() {
    const divElement = document.createElement("div");
    divElement.id = "menu-bar";
    divElement.className = "flex justify-start items-end gap-2 p-1";

    const matchBtn = Button(text, "h-10 w-18 rounded", () => {
            socket.send(JSON.stringify({ type: 'MATCH', id: id }));
        });
    matchBtn.id = "match-btn";

    const tourBtn = Button("TOURNAMENT", "h-10 w-24 rounded", () => {});

    const elementP = document.createElement("p");
    elementP.id = "server-state";
    elementP.className = "text-xs font-bold italic underline";
    elementP.textContent = serverState.state;

    divElement.appendChild(matchBtn);
    divElement.appendChild(tourBtn);
    divElement.appendChild(elementP);

    return divElement;
}