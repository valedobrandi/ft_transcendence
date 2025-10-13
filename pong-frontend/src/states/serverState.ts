import { navigateTo } from "../utils";
import { matchView } from "../views";
import { websocketStartMatch } from "../websocket/websocketStartMatch";

export const serverState = new Proxy({ state: "" }, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;
        const serverStateElement = document.getElementById("server-state");
        const matchBtn = document.getElementById("match-btn");
        const tourBtn = document.getElementById("tournament-btn");
        if (serverStateElement) {
            serverStateElement.textContent = value as string;
        }
        if (!matchBtn || !tourBtn) return true;
        switch (value) {
            case "MATCHED_ROOM":
                matchBtn.textContent = "SEARCH";
                matchBtn.className = `h-10 w-18 font-bold text-xs text-white
                        rounded bg-blue-500 load-btn`;
                break;
            case "GAME_ROOM":
                matchBtn.textContent = "PLAY";
                matchBtn.className = `h-10 w-18 font-bold text-xs text-white
                        rounded bg-green-500`;
                matchBtn.onclick = () => {
                    navigateTo("/match", matchView);
                    websocketStartMatch();
                };
                break;
            case "TOURNAMENT_ROOM":
                tourBtn.setAttribute("disabled", "true");
                tourBtn.className = `h-10 w-24 rounded bg-black text-white text-xs
		                uppercase font-bold disabled:cursor-not-allowed disabled:opacity-50`;
                break;
        }

        return true;
    }
});
