import { profile } from "../app";
import { stateProxyHandler } from "../states/stateProxyHandler";
import { ButtonMatchList } from "./ButtonMatchList";

export function MatchList(): string {
  const matchDiv = document.createElement("div");
  matchDiv.className = "flex-1 overflow-y-auto min-h-0 p-8";

  const matchListUl = document.createElement("ul");
  matchListUl.id = "match-list";
  matchListUl.className = "space-y-2";

  function onRenderMatchList() {
    matchListUl.innerHTML = "";

    if (stateProxyHandler.availableMatches.length === 0) {
      return;
    }

    const header = document.createElement("li");
    header.className = "grid grid-cols-[1fr_1fr_auto] gap-6 items-center border-b-4 p-2 border-[#424549] font-bold text-white text-lg";
 
    header.innerHTML = `
        <span>GAME TYPE</span>
        <span>CREATE BY</span>
        <span>ACTION</span>
      `;
    matchListUl.appendChild(header);
    stateProxyHandler.availableMatches.forEach((match) => {
      const isMatchCreatedByUser = match.createId === profile.id;
      if (isMatchCreatedByUser) {
        return;
      }
      const matchesLi = document.createElement("li");
      matchesLi.className = "grid grid-cols-[1fr_1fr_auto] gap-6 items-center border-b-2 p-2 border-[#424549]";

      const matchType = document.createElement("span");
      matchType.className = "p-2 text-white text-lg font-semibold";
      matchType.innerText = match.type;

      const createMatch = document.createElement("span");
      createMatch.className = "p-2 text-white text-lg font-semibold";
      const createUsername = stateProxyHandler.serverUsers.find(
        (user) => user.id === match.createId
      );
      createMatch.innerText = "UNKNOWN";
      if (createUsername) {
        createMatch.innerText = `${createUsername.name}`;
      }

      const actionBtn = document.createElement("span");
      actionBtn.innerHTML = ButtonMatchList(
        "match-list",
        isMatchCreatedByUser ? "cancel" : "join",
        `${match.matchId}`,
        !isMatchCreatedByUser
      );

      matchesLi.appendChild(matchType);
      matchesLi.appendChild(createMatch);
      matchesLi.appendChild(actionBtn);
      matchListUl.appendChild(matchesLi);
    });
  }

  onRenderMatchList();

  if (stateProxyHandler.availableMatches.length === 0) {
    const noMatchesLi = document.createElement("li");
    noMatchesLi.className = "text-center text-white";
    noMatchesLi.innerText = "NO MATCHES AVAILABLE";
    matchListUl.appendChild(noMatchesLi);
  }

  matchDiv.appendChild(matchListUl);
  return matchDiv.innerHTML;
}
