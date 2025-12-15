import { stateProxyHandler } from '../states/stateProxyHandler';

export function ButtonMatchList(dataContext: string, text: string, dataId: string, dataAction: boolean): string {

    const isMatchRoom = stateProxyHandler.state === "MATCH";
    const isTournamentRoom = stateProxyHandler.state === "TOURNAMENT";

    const disabled = isMatchRoom || isTournamentRoom;
    const mainDiv = document.createElement("div");
    function onRender() {
        
        const btnBg = dataAction ? "bg-green-500" : "bg-red-500";
        mainDiv.innerHTML = `<button
                    data-context="${dataContext}"
                    data-id="${dataId}"
                    data-action="${dataAction ? "true" : "false"}"
                    class="${btnBg} btn-game-${text} text-white text-base ml-4 p-2 rounded uppercase ${disabled ?? "opacity-50 cursor-not-allowed"}"
                    ${disabled ? "disabled" : ""}
                    >
                    ${text}
                    </button>`
                    
                }
    onRender();

    return mainDiv.innerHTML;
} 