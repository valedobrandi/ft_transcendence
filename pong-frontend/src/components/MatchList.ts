import { profile } from "../app";
import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";
import { EmbeddedButton } from "./EmbeddedButton";

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
      const createMatch = document.createElement("span");
      const createUsername = stateProxyHandler.serverUsers.find(
        (user) => user.id === match.createId
      );
      createMatch.innerText = `${createUsername?.name || "Unknown"}`;
      createMatch.classList = "p-2";

      const actionBtn = document.createElement("span");
      const userInMatch = match.createId === profile.id;
      actionBtn.innerHTML = EmbeddedButton(
        0,
        userInMatch ? "PLAY" : "CANCEL",
        match.matchId,
        ""
      );

      const btn = actionBtn.querySelector("button");
      if (btn) {
        btn.addEventListener(
          "click",
          userInMatch ? onClickJoinMatch : onClickCancelMatch
        );
      }

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

function onClickJoinMatch(event: Event) {
  const target = event.target as HTMLElement;
  if (target && target.id === "join-match-btn") {
    const matchId = Number(target.getAttribute("data-eventid"));
    // Implement join match logic here
  }
}

function onClickCancelMatch(event: Event) {
  const target = event.target as HTMLElement;
  if (target && target.id === "cancel-match-btn") {
    const matchId = Number(target.getAttribute("data-eventid"));
    // Implement cancel match logic here
  }
}
