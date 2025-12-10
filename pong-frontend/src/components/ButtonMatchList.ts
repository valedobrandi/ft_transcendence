import { stateProxyHandler } from '../states/stateProxyHandler';

export function ButtonMatchList(context: string, text: string, id: string, action: boolean): string {

    const isMatchRoom = stateProxyHandler.state === "MATCH_ROOM";
    const isTournamentRoom = stateProxyHandler.state === "TOURNAMENT_ROOM";

    const disabled = isMatchRoom || isTournamentRoom;
    //console.log("DISABLED BUTTON MATCH LIST:", disabled);
    const mainDiv = document.createElement("div");
    function onRender() {

        const btnBg = action ? "bg-green-500" : "bg-red-500";
        mainDiv.innerHTML = `<button
                    data-context="${context}"
                    data-id="${id}"
                    data-action="${action ? "true" : "false"}"
                    class="${btnBg} btn-game-${text} text-white ml-4 p-1 rounded text-xs uppercase ${disabled ? "opacity-50 cursor-not-allowed" : ""}"
                    ${disabled ? "disabled" : ""}
                    >
                    ${text}
                    </button>`
                    
                }
    onRender();

    return mainDiv.innerHTML;
}   