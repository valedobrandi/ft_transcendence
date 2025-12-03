import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

export function SettignsContainer(): HTMLDivElement {
  const root = document.createElement("div");

  const fileds = ["BALL SPEED", "BALL SIZE", "PADDLE SIZE", "MATCH POINTS"];
  const values = ["HIGH", "MEDIUM", "LOW"];
  root.innerHTML = "";
  function onRender() {
    console.log("Rendering Settings Container");
    if (stateProxyHandler.settings.state === '0') {
      root.innerHTML = "";
      return;
    }
    root.innerHTML = `
    <div 
    id="settings-container"
    class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-white p-12 rounded shadow-lg">
    <h2 class="text-xl font-bold mb-4">Settings</h2>
    <form class="mb-6">
    ${fileds
      .map(
        (field, _) => `
        <div class="mb-4">
        <label class="block text-gray-700 mb-2 font-semibold">${field}</label>
        <select class="border border-gray-300 rounded p-2 w-full">
        ${values.map(
          (value) => `
          <option
          ${value === "MEDIUM" ? "selected" : ""} 
          value="${value.toLowerCase()}">
          ${value}
          </option>
          `
        )
        .join("")}
        </select>
        </div>
        `
      )
      .join("")}
      <div class="flex justify-end">
      <button 
      id="save-settings" 
      class="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600">
      HUMAN
      </button>
      <button 
      id="cancel-settings" 
      class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
      Cancel
      </button>
      </div>
      </form>
      </div>
      </div>
      `;
      }

  onRender();
    
  onStateChange("settings", onRender);
  return root;
}
