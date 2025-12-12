import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

export function SettignsContainer(): HTMLDivElement {
const root = document.createElement("div");

const fields = ["BALL SPEED", "BALL SIZE", "PADDLE SIZE", "PADDLE SPEED", "MATCH POINTS"];
const values = ["HIGH", "MEDIUM", "LOW"];
root.innerHTML = "";
function onRender() {
//console.log("Rendering Settings Container");
if (stateProxyHandler.settings.state === "0") {
root.innerHTML = "";
return;
}
const ACCENT = "hsl(345,100%,47%)";
//const ACCENT_GLOW = "hsl(345,100%,65%)";

root.innerHTML = `
<div id="settings-container"
     class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">

  <div class="rounded-lg font-mono text-white crt p-10 w-full max-w-lg"
       style="
         background:#1e2124;
         border:4px solid ${ACCENT};
       ">

    <h2 class="text-3xl font-bold mb-6 text-center tracking-wider"
        style="color:${ACCENT};">
      SETTINGS
    </h2>

    <form name="settings-form" id="settings-form" class="mb-6 space-y-6">

      ${fields
        .map(
          (field) => `
      <div>
        <label class="block mb-2 font-bold text-white tracking-widest">
          ${field}
        </label>

        <select id="${field}"
          class="rounded p-2 w-full outline-none text-gray-400"
          style="
            background:#36393e;
            border:2px solid #424549;
            box-shadow:none;
          "
          onfocus="
            this.style.borderColor='${ACCENT}';
            
          "
          onblur="
            this.style.borderColor='#424549';
            this.style.boxShadow='none';
          ">

          ${values
            .map(
              (value) => `
            <option ${value==="MEDIUM" ? "selected" : "" } value="${value}">
              ${value}
            </option>`
            )
            .join("")}

        </select>
      </div>
      `
        )
        .join("")}

      <div class="flex justify-end gap-4 pt-4">

        <button id="save-settings"
          class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white"
          style="
            background:#2563eb;
           
          ">
          VS PLAYER
        </button>

        <button id="save-settings-computer"
          class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white"
          style="
            background:#f59e0b;
          ">
          VS COMPUTER
        </button>

        <button id="cancel-settings"
          class="px-5 py-2 text-white hover:opacity-80 active:scale-95"
          style="background:#424549;">
          CANCEL
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