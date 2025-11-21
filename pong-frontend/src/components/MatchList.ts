import { profile } from "../app";
import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";
import { ButtonMatchList } from "./ButtonMatchList";

export function MatchList(): HTMLDivElement {
  const matchListDiv = document.createElement("div");
  matchListDiv.id = "match-list";
  matchListDiv.className = "flex flex-col gap-2 p-4";

  function onRenderMatchList() {
    matchListDiv.innerHTML = "";
    const matchList = stateProxyHandler.availableMatches;
    matchList.forEach((match) => {
      const matchDiv = document.createElement("div");
      matchDiv.className =
        "border p-2 flex justify-between gap-10 items-center";

      const matchInfo = document.createElement("span");
      matchInfo.innerText = `${match.matchId}`;
      matchInfo.classList = "p-2";

      const matchStatus = document.createElement("span");
      matchStatus.innerText = `${match.status}`;
      matchStatus.classList = "p-2";
      matchDiv.appendChild(matchStatus);

      const createMatch = document.createElement("span");
      const createUsername = stateProxyHandler.serverUsers.find(
        (user) => user.id === match.createId
      );
      createMatch.innerText = `${createUsername?.name || "Unknown"}`;
      createMatch.classList = "p-2";

      const actionBtn = document.createElement("span");
      const isMatchCreatedByUser = match.createId === profile.id;

      actionBtn.innerHTML = ButtonMatchList(
        "match-list",
        isMatchCreatedByUser ? "cancel" : "join",
        `${match.matchId}`,
        !isMatchCreatedByUser
      );

      matchDiv.appendChild(matchInfo);
      matchDiv.appendChild(createMatch);
      matchDiv.appendChild(actionBtn);
      matchListDiv.appendChild(matchDiv);
    });
  }

  onRenderMatchList();
  onStateChange("availableMatches", onRenderMatchList);
  return matchListDiv;
}
