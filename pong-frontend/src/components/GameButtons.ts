import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

export function GameActionBtn(): HTMLDivElement {
  const rootDiv = document.createElement("div");
  rootDiv.id = "game-buttons-container";
  rootDiv.classList.add("flex", "justify-evenly", "w-full", "mt-6", "mb-6");

  const isConnected = stateProxyHandler.state === "CONNECTED";

  function onRender() {
    rootDiv.innerHTML = `
        <button class="px-10 py-4 rounded text-white bg-green-500 hover:bg-green-600 uppercase
          ${!isConnected ? " cursor-not-allowed opacity-50" : ""} 
          ${isConnected ? "bg-green-500" : "bg-blue-500"}" 
          ${!isConnected ? "disabled" : ""} 
          id="match-btn"
        >
          PLAY MATCH
        </button>
        <button class="px-10 py-4 rounded text-white bg-green-500 hover:bg-green-600 uppercase 
          ${!isConnected ? " cursor-not-allowed opacity-50 bg-gray-500" : ""} 
          ${isConnected ? "bg-green-500" : "bg-blue-500"}" 
          ${!isConnected ? "disabled" : ""} 
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