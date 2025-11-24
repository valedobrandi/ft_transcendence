import { serverState } from "../states/serverState";

export function GameButtons() {
  const shouldDisable =
    serverState.state === "MATCH_ROOM" ||
    serverState.state === "TOURNAMENT_ROOM";

  const isMatch = serverState.state === "MATCH_ROOM";
  const isTournament = serverState.state === "TOURNAMENT_ROOM";
  return `
    <div class="p-4 flex justify-around items-center w-full">
      <button class="border-2 border-black p-4 rounded" ${
        shouldDisable ? "disabled" : ""
      }>
        CREATE GAME
      </button>
      <button 
        class="border-2 border-black p-4 rounded hover:bg-gray-200"
        ${shouldDisable ? "disabled" : ""}
        id="match-btn"
      >
        PLAY MATCH
      </button>
      <button 
        class="border-2 border-black p-4 rounded hover:bg-gray-200" 
        ${shouldDisable ? "disabled" : ""}
        ${shouldDisable ? "cursor-not-allowed opacity-50" : ""}
        id="tournament-btn"
      >
        PLAY TOURNAMENT
      </button>
    </div>
  `;
}
