
// import { Button } from "./Button";
// import { profile } from "../app";
// import { ws } from "../websocket";
// import { fetchRequest } from "../utils";

// export function Menu(): HTMLDivElement {

//     const socket = ws();

//     const divElement = document.createElement("div");
//     divElement.id = "menu-bar";
//     divElement.className = "flex justify-start items-end gap-2 p-1";

//     const matchBtn = Button('MATCH', "h-10 w-18 rounded", () => {
//         if (!socket) return;
//         socket.send(JSON.stringify({ type: 'MATCH', username: profile.username, userId: profile.id }));
//     });
//     matchBtn.id = "match-btn";

//     const joinTournament = Button("TOURNAMENT", "h-10 w-30 rounded", () => {});
//     joinTournament.id = "tournament-btn";

//     const CreateMatchBtn = Button("CREATE MATCH", "h-10 w-30 rounded", async () => {
//         await fetchRequest("/match-create", "POST", {}, {
//             body: JSON.stringify({ settings: {username: profile.username} })
//         });
//     });
    
//     CreateMatchBtn.id = "match-btn";

//     divElement.appendChild(matchBtn);
//     divElement.appendChild(joinTournament);
//     divElement.appendChild(CreateMatchBtn);

//     return divElement;
// }
