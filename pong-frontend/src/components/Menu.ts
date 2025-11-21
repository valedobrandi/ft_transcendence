import { serverState } from "../states/serverState";

import { Button } from "./Button";
import { profile } from "../app";
import { getSocket } from "../websocket";
import { fetchRequest } from "../utils";

export function Menu(): HTMLDivElement {

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

    const joinTournament = Button("TOURNAMENT", "h-10 w-30 rounded", () => {});
    joinTournament.id = "tournament-btn";

    const CreateMatchBtn = Button("CREATE MATCH", "h-10 w-30 rounded", async () => {
        const response = await fetchRequest("/match-create", "POST", {}, {
            body: JSON.stringify({ settings: {username: profile.username} })
        });
    });
    CreateMatchBtn.id = "create-match-btn";

    shouldDisable && matchBtn.setAttribute("disabled", "true");
    shouldDisable && joinTournament.setAttribute("disabled", "true");

    matchBtn.className += ` ${shouldDisable ? "cursor-not-allowed opacity-50" : ""} ${isMatch ? "bg-green-500" : ""}`;
    joinTournament.className += ` ${shouldDisable ? "cursor-not-allowed opacity-50" : ""} ${isTournament ? "bg-green-500" : ""}`;

    divElement.appendChild(matchBtn);
    divElement.appendChild(joinTournament);
    divElement.appendChild(CreateMatchBtn);

    return divElement;
}
