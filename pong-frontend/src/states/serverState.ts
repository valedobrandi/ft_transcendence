export const serverState = new Proxy({ state: "" }, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;

        const serverStateElement = document.getElementById("server-state");
		
        const matchBtn = document.getElementById("match-btn");
        const tourBtn = document.getElementById("tournament-btn");

        if (serverStateElement) {
            serverStateElement.textContent = value as string;
        }
        if (!matchBtn || !tourBtn) return true;
        if (value === "MATCH_ROOM" || value === "TOURNAMENT_ROOM") {
            matchBtn.setAttribute("disabled", "true");
            tourBtn.setAttribute("disabled", "true");

            const isDisabled = (type: string) => type === value;
            matchBtn.className = `h-10 w-18 rounded bg-black text-white text-xs
                uppercase font-bold disabled:cursor-not-allowed disabled:opacity-50
                ${isDisabled("MATCH_ROOM") ? "disabled:bg-green-500" : ""}`;
            tourBtn.className = `h-10 w-24 rounded bg-black text-white text-xs
                uppercase font-bold disabled:cursor-not-allowed disabled:opacity-50
                ${isDisabled("TOURNAMENT_ROOM") ? "disabled:bg-green-500" : ""}`;
        }

        return true;
    }
});
