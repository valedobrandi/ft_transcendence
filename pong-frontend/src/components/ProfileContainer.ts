import DOMPurify from "dompurify";
import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";
import { profile } from "../app";

export const matches = Array.from({ length: 40 }, (_, i) => ({
	createAt: new Date(),
	player1: "messi",
	score1: 5,
	player2: "ronaldo",
	score2: 4,
}));

function BlockButton(): string {
	console.log("BlockButton render", stateProxyHandler.chatBlockList);
	const isBlocked = stateProxyHandler.chatBlockList?.includes(
		stateProxyHandler.selectChat?.id
	);

	const html = `
		<button id="${isBlocked ? "btn-unblock-user" : "btn-block-user"}"
			class="border-2 border-black p-6 rounded ${isBlocked ? " bg-green-300" : "bg-red-300"
				}">
			${isBlocked ? "UNBLOCK" : "BLOCK"}
		</button>
		`;

	return html;
}

function addFriendButton(): string {
	const isFriend = stateProxyHandler.friendList?.some(
		(friend) => friend.id === stateProxyHandler.selectChat?.id
	);

	if (isFriend) {
		return `
		<button id="btn-friend-list"
			class="border-2 border-black p-6 rounded opacity-50 cursor-not-allowed bg-gray-300"
			disabled>
			ADD FRIEND
		</button>
		`;
	} else {
		return `
		<button id="btn-friend-list"
			class="border-2 border-black p-6 rounded bg-green-300">
			ADD FRIEND
		</button>
		`;
	}
}

export function ProfileContainer() {
	const mainDiv = document.createElement("div");

	function onRender() {
		const matchesHistory = stateProxyHandler.matchesHistory;
		const isUserProfile = stateProxyHandler.selectChat.id === profile.id;
		mainDiv.innerHTML = `
		<div class="flex flex-col border-2 border-black rounded-2xl h-full text-base">
			<h2 class="border-b-2 border-black text-xl font-bold p-2 text-center">
				PROFILE VIEW
			</h2>
			<!-- Grid container with 3 stacked sections -->
			<div class="flex-1 grid grid-rows-[1fr_1fr_3fr] gap-4 p-8">
				<!-- Container 1: Avatar and buttons -->
				<div class="flex items-center justify-around">
					<!-- Avatar -->
					<div class="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden">
						<img src=${stateProxyHandler.profile.avatar} 
						alt="Avatar" 
						class="w-full h-full object-cover" />
					</div>

					<!-- Buttons column -->
					<div class="flex flex-col gap-2 w-40 h-40">
						${ isUserProfile ? "" : addFriendButton()}
						${ isUserProfile ? "" : BlockButton()}
					</div>
				</div>

				<!-- Container 2: Stack of P tags -->
				<div class="flex flex-col items-start gap-2">
					<p>${DOMPurify.sanitize(stateProxyHandler.profile.username)} </p>
					<p>WINS: ${matchesHistory.wins}</p>
					<p>LOSES: ${matchesHistory.loses}</p>
				</div>

				<!-- Container 3: List -->
				<div class="min-h-0">
					<h3 class="text-lg font-bold mb-2">Match History</h3>
					<ul class=" overflow-y-auto min-h-0 max-h-[50vh] space-y-2 text-base">
						${matchesHistory.history.length !== 0
						? matchesHistory.history
							.map(
								(match) =>
									`<li class="p-2">
							<span>${match.createAt.toLocaleDateString()}</span>
							<span>${match.player1}</span>
							<span class=${match.score1 > match.score2 ? "text-green-800" : "text-red-800"}>
								${match.score1}
							</span>
							X
							<span>
								${match.player2}
							</span>
							<span class=${match.score2 > match.score1 ? "text-green-800" : "text-red-800"}>
								${match.score2}
							</span>
						</li>`
							)
							.join("")
						: `<li>PLAY A GAME TO START TRACKING YOUR STATS</li>`
					}
					</ul>
				</div>
			</div>

		</div>
		`;
	}

	onStateChange("profile", onRender);
	onStateChange("matchesHistory", onRender);
	onStateChange("chatBlockList", onRender);
	onRender();
	return mainDiv;
}
