import { profile } from "../app";
import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

function SelectOption(fields: string[], values: string[], matchPointsOptions: number[]): string {
  const ACCENT = "hsl(345,100%,47%)";
  return `
        <div id="settings-container"
          class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">

          <div class="rounded-lg font-mono text-white crt p-10 w-full max-w-lg" style="
                background:#1e2124;
                border:4px solid ${ACCENT};
              ">
            <h2 class="text-3xl font-bold mb-6 text-center tracking-wider" style="color:${ACCENT};">
              SETTINGS
            </h2>
            <form name="settings-form" id="settings-form" class="mb-6 space-y-6">
              ${fields.map((field) => `
              <div>
                <label class="block mb-2 font-bold text-white tracking-widest">
                  ${field}
                </label>

                <select id="${field}" class="rounded p-2 w-full outline-none text-gray-400" style="
                    background:#36393e;
                    border:2px solid #424549;
                    box-shadow:none;
                    " onfocus="
                    this.style.borderColor='${ACCENT}';
                    " onblur="
                    this.style.borderColor='#424549';
                    this.style.boxShadow='none';
                  ">
                  ${values.map((value, index) => `
                  <option ${value === "MEDIUM" ? "selected" : ""} 
                    value="${value}">
                    ${ field === "MATCH POINTS" ? matchPointsOptions[index] : value }
                  </option>`).join("")}
                </select>
              </div>
              `).join("")}
              <div class="flex justify-end gap-4 pt-4">
                <button id="save-settings" class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white"
                  style="
                    background:#2563eb;
                  ">
                  VS PLAYER
                </button>
                <button id="save-settings-computer"
                  class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white" style="
                    background:#f59e0b;
                  ">
                  VS COMPUTER
                </button>
                <button class="px-5 py-2 text-white hover:opacity-80 active:scale-95"
                  style="background:#424549;"
                  id="cancel-settings">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
    `;
}

function WaitingMatch(): string {
  const matches = stateProxyHandler.availableMatches;
  const createdMatch = matches.find((match => match.createId === profile.id));
  return `
    <div id="waiting-match-container"
      class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">
      <div class="flex flex-col justify-center items-center rounded-lg font-mono text-white crt p-10 w-fit" 
          style="
            background:#1e2124;
            border:4px solid hsl(345,100%,47%);
          ">
        <h2 class="text-3xl font-bold mb-6 text-center tracking-wider" style="color:hsl(345,100%,47%);">
          WAITING FOR OPPONENT...
        </h2>
        <button 
          class="px-5 py-2 text-lg rounded-lg text-white bg-red-700 hover:opacity-80"
          id="cancel-settings"
          data-context="match-list"
          data-id="${createdMatch?.matchId || ""}"
          data-action="false"
        >
          CANCEL
        </button>
      </div>
    </div>
  `;
}

function PlayingMatch(): string {
  return `
    <div id="playing-match-container"
      class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">
      <div class="flex flex-col justify-center items-center rounded-lg font-mono text-white crt p-10 w-fit" 
          style="
            background:#1e2124;
            border:4px solid hsl(345,100%,47%);
          ">
        <h2 class="text-3xl font-bold mb-2 text-center tracking-wider" style="color:hsl(345,100%,47%);">
          YOU ARE IN A MATCH!
        </h2>
        <p class="mt-4 text-center underline mb-2">
          WARNING: YOU WILL NEED THE MATCH TO FINISH TO PLAY AGAIN!
        </p>
        <button 
          class="px-5 py-2 w-[300px] text-lg rounded-lg text-white bg-red-700 hover:opacity-80"
          data-context="match"
          data-action="quitMatch"
        >
          LEAVE MATCH
        </button>
        <button 
          class="mt-4 px-5 py-2 w-[300px] text-lg rounded-lg text-white bg-blue-600 hover:opacity-80"
          id="go-to-match"
        >
          RETURN
        </button>
      </div>
    </div>
  `;
}

export function TournamentWait(): string {
    const state = stateProxyHandler.tournamentQueue;
    const queueLength = state.length;
    return `
    <div id="waiting-match-container"
      class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">
      <div class="flex flex-col justify-center items-center rounded-lg font-mono text-white crt p-10 w-[1000px]" 
          style="
            background:#1e2124;
            border:4px solid hsl(345,100%,47%);
          ">
          <h2 class="text-3xl font-bold mb-6 text-center tracking-wider" style="color:hsl(345,100%,47%);">
          WAITING FOR OTHER PLAYERS (${queueLength})/4
          </h2>
          <p class="mb-6 text-center underline">
          THE TOURNAMENT WILL START AUTOMATICALLY WHEN 4 PLAYERS HAVE JOINED!
          </p>
          <p class="mb-6 text-center text-xl">
            PLAYERS WAITING: ${state.map((player) => `<span class=>${player.username}</span>`).join("  ")}
          </p>
          <button 
            class="px-5 py-2 text-lg rounded-lg tracking-widest text-white bg-red-700 hover:opacity-80"
            id="btn-leave-tournament"
            >
              CLICK TO LEAVE THE TOURNAMENT QUEUE
            <p class="mb-6 text-center underline text-xs">
              WARNING: IF YOU LEAVE THE TOURNAMENT, YOU WILL BE REMOVED FROM THE QUEUE!
            </p>
          </button>
      </div>
    </div>
  `;
}

export function InvitationReceive(): string {
  const ACCENT = "hsl(345,100%,47%)";
  const state = stateProxyHandler.invite;
  if (!state)
    return "";
  return `
    <div id="match-invitation-container"
      class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">
      <div class="rounded-lg font-mono text-white crt p-10 w-full max-w-lg" style="
            background:#1e2124;
            border:4px solid ${ACCENT};
          ">
        <h2 class="text-3xl font-bold mb-6 text-center tracking-wider" style="color:${ACCENT};">
          MATCH INVITATION
        </h2>
        <p class="mb-6 text-center">
          You have been invited by <span class="font-bold underline">${state.username}</span> to a match! Do you want to accept the invitation?
        </p>
        <div class="flex justify-end gap-4 pt-4">
          <button 
            class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white"
            style="background:#16a34a;"
            data-action="accept-invitation" 
            data-matchid="${state.matchId}"
          >
            ACCEPT
          </button>
          <button 
          style="background:#424549;"
            class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white"
            data-matchid="${state.matchId}"
            data-action="refuse-invitation" 
          >
            DECLINE
          </button>
        </div>
      </div>
    </div>
  `;
}

export function InvitationSent(): string {
  const ACCENT = "hsl(345,100%,47%)";
  const state = stateProxyHandler.invite;
  if (!state)
    return "";
  return `
    <div id="match-invitation-sent-container"
      class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">
      <div class="rounded-lg font-mono text-white crt p-10 w-full max-w-lg" style="
            background:#1e2124;
            border:4px solid ${ACCENT};
          ">
        <h2 class="text-3xl font-bold mb-6 text-center tracking-wider" style="color:${ACCENT};">
          INVITATION SENT
        </h2>
        <p class="mb-6 text-center">
          Your match invitation has been sent! Waiting for the other player to respond...
        </p>
        <div class="flex justify-end gap-4 pt-4">
          <button 
          style="background:#424549;"
            class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white"
            data-action="cancel-invitation" 
            data-matchid="${state.matchId}"
          >
            CANCEL INVITATION
          </button>
        </div>
      </div>
    </div>
  `;
}

export function InstanceDisconnect(): HTMLDivElement {
  const ACCENT = "hsl(345,100%,47%)";
  const root = document.createElement("div")
  root.innerHTML =  `
    <div id="match-invitation-sent-container"
      class="fixed inset-0 flex items-center justify-center bg-[#1e2124]/70 backdrop-blur-sm z-50 px-4">
      <div class="rounded-lg font-mono text-white crt p-10 w-full max-w-lg" style="
            background:#1e2124;
            border:4px solid ${ACCENT};
          ">
        <h2 class="text-3xl font-bold mb-6 text-center tracking-wider" style="color:${ACCENT};">
          YOU ARE DISCONNECTED!
        </h2>
        <p class="mb-6 text-center">
          ANOTHER INSTANCE HAS BEEN CONNECTED
        </p>
        <div class="flex justify-end gap-4 pt-4">
          <button 
          style="background:#424549;"
          class="px-5 py-2 font-bold rounded hover:opacity-80 active:scale-95 text-white"
          id="websocket-disconnect"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  `;

  return root;
}

export function GameStateContainer(): HTMLDivElement {
  const root = document.createElement("div");

  const fields = [
    "BALL SPEED",
    "BALL SIZE",
    "PADDLE SIZE",
    "PADDLE SPEED",
    "MATCH POINTS",
  ];
  const matchPointsOptions = [6, 4, 2];
  const values = ["HIGH", "MEDIUM", "LOW"];
  root.innerHTML = "";
  function onRender() {
    const state = stateProxyHandler.settings.state;

    if (state === "0") {
      root.innerHTML = "";
    }
    if (state === "game.settings") {
      root.innerHTML = SelectOption(fields, values, matchPointsOptions);
    }
    if (state === "match.waiting") {
      root.innerHTML = WaitingMatch();
    }
    if (state === "match.playing") {
      root.innerHTML = PlayingMatch();
    }
    if (state === "tournament.waiting") {
      root.innerHTML = TournamentWait();
    }
    if (state === "invite.receive") {
      root.innerHTML = InvitationReceive();
    }
    if (state === "invite.sent") {
      root.innerHTML = InvitationSent();
    }
  }

  onRender();

  onStateChange("settings", onRender);
  onStateChange("tournamentQueue", onRender);
  return root;
}
