import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

export function TournamentIntra(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.id = "tournament-intra-messages";
    wrapper.className = "flex flex-col gap-4 overflow-y-auto h-full ml-2";
    wrapper.style.background = "#1e2124";
    wrapper.style.border = "2px solid hsl(345,100%,47%)";
    function onRender() {
        const messages = stateProxyHandler.tournamentIntra;
        wrapper.innerHTML = "";
        if (messages.length === 0) {
            wrapper.style.display = "none";
            return;
        } else {
            wrapper.style.display = "flex";
        }
        
        wrapper.innerHTML = `
                <div class=" rounded-lg font-mono text-white flex flex-col p-4"> 
                    <h2 class="text-3xl font-bold m-2 text-center tracking-wider text-nowrap" style="color:hsl(345,100%,47%);">
                        FT_TOURNAMENT 
                    </h2>
                    ${messages.map((msg) => `<p class="p-4 text-nowrap text-white font-bold text-left text-2xl">${msg}</p>`).join("")}
                </div>`;
    }
    onRender();
    onStateChange("tournamentIntra", onRender);
    return wrapper;
}

