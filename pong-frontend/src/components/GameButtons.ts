import { stateProxyHandler } from "../states/stateProxyHandler";

export function GameButtons() {

  const isMatch = stateProxyHandler.state === "MATCH_ROOM";
  const isTournament = stateProxyHandler.state === "TOURNAMENT_ROOM";

  const isDisabled = isMatch || isTournament;
  return `
    <div class="p-4 flex justify-around items-center w-full">
      <button 
        class="border-2 border-black p-4 rounded hover:bg-gray-200
          ${isDisabled ? "cursor-not-allowed opacity-50" : ""}
          ${isMatch ? "bg-green-500" : "bg-white"}"
          ${isDisabled ? "disabled" : ""}
        id="create-match-btn"
      >
        CREATE GAME
      </button>
      <button 
        class="border-2 border-black p-4 rounded hover:bg-gray-200 
          ${isDisabled ? "cursor-not-allowed opacity-50" : ""}
          ${isTournament ? "bg-green-500" : "bg-white"}" 
          ${isDisabled ? "disabled" : ""}
        
        id="tournament-btn"
      >
        PLAY TOURNAMENT
      </button>
    </div>
  `;
}
