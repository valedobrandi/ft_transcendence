export const serverState = new Proxy({ state: "" }, {
    set(target, prop, value) {
        target[prop as keyof typeof target] = value;
		
        const matchBtn = document.getElementById("match-btn");
        const tourBtn = document.getElementById("tournament-btn");

        const joinButtons = document.querySelectorAll(".btn-game-join");

        if (!matchBtn || !tourBtn) return true;

        if (value === "MATCH_ROOM" || value === "TOURNAMENT_ROOM") {
            matchBtn.setAttribute("disabled", "true");
            tourBtn.setAttribute("disabled", "true");

            const isDisabled = (type: string) => type === value;
            matchBtn.className += ` disabled:cursor-not-allowed disabled:opacity-50
                ${isDisabled("MATCH_ROOM") ? "disabled:bg-green-500" : ""}`;
            tourBtn.className += ` disabled:cursor-not-allowed disabled:opacity-50
                ${isDisabled("TOURNAMENT_ROOM") ? "disabled:bg-green-500" : ""}`;

            joinButtons.forEach((btn) => {
                (btn as HTMLButtonElement).setAttribute("disabled", "true");
                btn.classList.add("opacity-50", "cursor-not-allowed");
            });
        }

        if (value === "CONNECT_ROOM") {
            joinButtons.forEach((btn) => {
                (btn as HTMLButtonElement).removeAttribute("disabled");
                btn.classList.remove("opacity-50", "cursor-not-allowed");
            });
        }

        return true;
    }
});
