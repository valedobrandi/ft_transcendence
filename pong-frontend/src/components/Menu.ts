import { serverState } from "../states/serverState";

import { Button } from "./Button";
import { profile } from "../app";
import { getSocket } from "../websocket";

export function Menu():HTMLDivElement {

    const socket = getSocket();

    const shouldDisable = serverState.state === "MATCH_ROOM" || serverState.state === "TOURNAMENT_ROOM";
    const isMatch = serverState.state === "MATCH_ROOM";
    const isTournament = serverState.state === "TOURNAMENT_ROOM";


    const divElement = document.createElement("div");
    divElement.id = "menu-bar";
    divElement.className = "flex justify-start items-end gap-2 p-1";

    const matchBtn = Button('MATCH', "h-10 w-18 rounded", () => {
        if (!socket) return;
        socket.send(JSON.stringify({ type: 'MATCH', username: profile.username, userId: profile.id }));
    });
    matchBtn.id = "match-btn";

    const tourBtn = Button("TOURNAMENT", "h-10 w-30 rounded", () => {
        if (!socket) return;
        socket.send(JSON.stringify({ type: 'TOURNAMENT', username: profile.username }));
    });
    tourBtn.id = "tournament-btn";

    shouldDisable && matchBtn.setAttribute("disabled", "true");
    shouldDisable && tourBtn.setAttribute("disabled", "true");

    matchBtn.className += ` ${shouldDisable ? "cursor-not-allowed opacity-50" : ""} ${isMatch ? "bg-green-500" : ""}`;
    tourBtn.className += ` ${shouldDisable ? "cursor-not-allowed opacity-50" : ""} ${isTournament ? "bg-green-500" : ""}`;

    divElement.appendChild(matchBtn);
    divElement.appendChild(tourBtn);

    return divElement;
}
