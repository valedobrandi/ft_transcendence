import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

export function GameActionBtn(): HTMLDivElement {
  const rootDiv = document.createElement("div");
  rootDiv.id = "game-buttons-container";
  rootDiv.classList.add("flex", "justify-evenly", "w-full", "mt-6", "mb-6");

  const isMatch = stateProxyHandler.state === "MATCH";
  const isTournament = stateProxyHandler.state === "TOURNAMENT";

  const isDisabled = isMatch || isTournament;
  function onRender() {
    rootDiv.innerHTML = `
        <button class="px-10 py-4 rounded text-white bg-green-500 hover:bg-green-600 uppercase
          ${isDisabled ? " cursor-not-allowed opacity-50" : ""} 
          ${isMatch ? "bg-green-500" : "bg-blue-500"}" 
          ${isDisabled ? "disabled" : ""} 
          id="match-btn"
        >
          PLAY MATCH
        </button>
        <button class="px-10 py-4 rounded text-white bg-green-500 hover:bg-green-600 uppercase 
          ${isDisabled ? " cursor-not-allowed opacity-50" : ""} 
          ${isTournament ? "bg-green-500" : "bg-blue-500"}" 
          ${isDisabled ? "disabled" : ""} 
          id="tournament-btn"
        >
          PLAY TOURNAMENT
        </button>
      `;
  }
  onRender();
  onStateChange("state", onRender);
  return rootDiv;
}