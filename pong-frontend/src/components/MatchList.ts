import { profile } from "../app";
import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";
import { ButtonMatchList } from "./ButtonMatchList";

const mockMatches = [
  { matchId: "OTHER SETTINGS", status: "PLAYER NAME", createId: 2 },
  { matchId: "OTHER SETTINGS", status: "PLAYER NAME", createId: 3 },
  { matchId: "OTHER SETTINGS", status: "PLAYER NAME", createId: 4 },
];

export function MatchList(): string {
  const matchDiv = document.createElement("div");
  matchDiv.className = "flex-1 overflow-y-auto min-h-0 p-8";

  const matchListUl = document.createElement("ul");
  matchListUl.id = "match-list";
  matchListUl.className = "space-y-2";

  const matchList = mockMatches;
  function onRenderMatchList() {
    matchListUl.innerHTML = "";
    matchList.forEach((match) => {
      const matchesLi = document.createElement("li");
      matchesLi.className =
        "flex justify-between items-center border-b-2 p-2";

      const matchInfo = document.createElement("span");
      matchInfo.innerText = `${match.matchId}`;
      matchInfo.classList = "p-2";

      const matchStatus = document.createElement("span");
      matchStatus.innerText = `${match.status}`;
      matchStatus.classList = "p-2";
      matchesLi.appendChild(matchStatus);

      const createMatch = document.createElement("span");
      const createUsername = stateProxyHandler.serverUsers.find(
        (user) => user.id === match.createId
      );
      createMatch.innerText = `${createUsername?.name || "STATUS"}`;
      createMatch.classList = "p-2";

      const actionBtn = document.createElement("span");
      const isMatchCreatedByUser = match.createId === profile.id;

      actionBtn.innerHTML = ButtonMatchList(
        "match-list",
        isMatchCreatedByUser ? "cancel" : "join",
        `${match.matchId}`,
        !isMatchCreatedByUser
      );

      matchesLi.appendChild(matchInfo);
      matchesLi.appendChild(createMatch);
      matchesLi.appendChild(actionBtn);
      matchListUl.appendChild(matchesLi);
    });
  }

  onRenderMatchList();
  onStateChange("availableMatches", onRenderMatchList);
  if (matchList.length === 0) {
    const noMatchesLi = document.createElement("li");
    noMatchesLi.className = "text-center";
    noMatchesLi.innerText = "NO MATCHES AVAILABLE";
    matchListUl.appendChild(noMatchesLi);
  }

  matchDiv.appendChild(matchListUl);
  return matchDiv.innerHTML || "";
}
