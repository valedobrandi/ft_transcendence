import { ProfileLogoutButton } from "./ProfileLogoutButton";
import { GameActionBtn } from "./GameButtons";
import { MatchList } from "./MatchList";
import { onStateChange } from "../states/stateProxyHandler";

export const items = Array.from({ length: 40 }, (_, i) => `SHOW CREATE GAME ${i + 1}`);

// Main container
export function GameContainerUI() {
  const root = document.createElement("div");
  root.className = "min-h-0 flex flex-col gap-y-4";
  const onRender = () => {

    root.innerHTML = `
    ${ProfileLogoutButton()}
    <div class="flex-1 flex flex-col min-h-0 border-2 border-black rounded-2xl">
      <h2 class="text-2xl font-bold text-center p-4 border-b-2 border-black">
        GAME VIEW
      </h2>
      <div class="flex-1 overflow-y-auto min-h-0 p-8">
        ${MatchList()}
      </div>
      ${GameActionBtn()}
    </div>
    `;
  }
  
  onRender();
  onStateChange( "state",onRender);
  onStateChange( "availableMatches",onRender);
  return root;
}
