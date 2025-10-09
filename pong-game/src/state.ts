import { navigateTo } from "./utils";
import { matchView } from "./views";

export const serverState = new Proxy({state: ""}, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;
        const serverStateElement = document.getElementById("server-state");
        const matchBtn = document.getElementById("match-btn");
        if (serverStateElement) {
            serverStateElement.textContent = value as string;
        }
        if (matchBtn) {
            switch (value) {
                case "MATCHED_ROOM":
                    matchBtn.textContent = "SEARCH";
                    matchBtn.className = `h-10 w-18 font-bold text-xs text-white 
                        rounded bg-blue-500 gentle-ping`;
                    break;
                case "GAME_ROOM":
                    matchBtn.textContent = "PLAY";
                    matchBtn.className = `h-10 w-18 font-bold text-xs text-white 
                        rounded bg-green-500`;
                    matchBtn.onclick = () => navigateTo("/match", matchView);
                    break;
            }
        }
        return true;
    }
});

