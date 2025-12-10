import DOMPurify from "dompurify";
import { profile } from "../app";
import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";
import { SystemMessageChat } from "./ChatIntra";
import { ChatSendInput } from "./ChatSendInput";
import { UsersList } from "./UsersList";
import { MatchList } from "./MatchList";
import { endpoint } from "../endPoints";

export function Intra(): HTMLElement {
    const mainDiv = document.createElement("div");
    mainDiv.id = "main-chat-container";
    mainDiv.className = "flex flex-row h-screen w-screen";

    // ====================================================================== //
    //                                                                        //
    //                                Left Part                               //
    //                                                                        //
    // ====================================================================== //

    const leftParent = document.createElement("div");
    leftParent.id = "left-parent";
    leftParent.className = "border-10 border-r-5 border-[#1e2124] flex flex-col flex-1 shrink-0 h-full";

    // ====================================================================== //
    //     Upper Section (Chat + Users) - 66% height                          //
    // ====================================================================== //

    const contentDiv = document.createElement("div");
	contentDiv.id = "content-div";
    contentDiv.className = "border-b-10 border-[#1e2124] flex h-2/3 min-h-0";

    // Chat
    const chatWidget = document.createElement("div");
    chatWidget.id = "chatWidget";
    chatWidget.className = "flex flex-col flex-1 border-r-10 border-[#1e2124]";

    // Chat Header Text
    const chatTabs = document.createElement("div");
    chatTabs.id = "chat-tabs";
    chatTabs.className = "flex border-b-1 border-[#424549] bg-[#36393e] h-10 text-white";

    // Chat Message Box
    const messages = document.createElement("div");
    messages.id = "messages";
    messages.className = "border-0 flex-1 overflow-y-auto p-3 bg-[#282b30] text-white";

    // Chat Input
    const inputDiv = ChatSendInput();

    chatWidget.appendChild(chatTabs);
    chatWidget.appendChild(messages);
    chatWidget.appendChild(inputDiv);

    // User/Friend
    const usersDiv = document.createElement("div");
    usersDiv.id = "users-list";
    usersDiv.className = "border-0 w-xs";
    usersDiv.appendChild(UsersList()!);

    contentDiv.appendChild(chatWidget);
    contentDiv.appendChild(usersDiv);

    // ====================================================================== //
    //     Lower Section (System Message) - 33% height                        //
    // ====================================================================== //

    const intraContainer = SystemMessageChat();
    intraContainer.className = "flex flex-col flex-1 border-0 w-full min-h-0 overflow-y-auto";

    leftParent.appendChild(contentDiv);
    leftParent.appendChild(intraContainer);

    // ====================================================================== //
    //                                                                        //
    //                               Middle Part                              //
    //                                                                        //
    // ====================================================================== //

    const middleParent = document.createElement("div");
    middleParent.id = "middle-parent";
    middleParent.className = "border-10 border-r-5 border-l-5 border-[#1e2124] flex flex-col flex-1 shrink-0 h-full bg-[#282b30]";

    function onRender() {
        middleParent.innerHTML = "";

        const matchesHistory = stateProxyHandler.matchesHistory;
        const isUserProfile = stateProxyHandler.selectChat.id === profile.id;

        // ================================================================== //
        //     Upper Section (Avatar + Nickname + Stats + Buttons)            //
        // ================================================================== //

        const profileContainer = document.createElement("div");
        profileContainer.className = "flex justify-between items-center mt-6 px-30";

        // Header
        const profileHeader = document.createElement("div");
        profileHeader.className = "flex items-center justify-center border-5 border-[#424549] text-white";
        profileHeader.textContent = "PROFILE";
        middleParent.appendChild(profileHeader);

        // Profile Div
        const profileDiv = document.createElement("div");
        profileDiv.className = "flex flex-col items-center";

        // Avatar
        const profileAvatar = document.createElement("img");
        const usersAvatarPath = `${endpoint.pong_backend_api}/avatar/${stateProxyHandler.profile.avatar}`;
        profileAvatar.src = usersAvatarPath;
        profileAvatar.alt = `${stateProxyHandler.profile.avatar}'s avatar`;
        profileAvatar.className = "w-32 h-32 rounded-full mx-auto mt-6 border-5 border-[#424549] object-cover";

        // Username + Stats
        const profileName = document.createElement("div");
        profileName.className = "text-white mt-2 mb-10 flex flex-col items-center"
        const nick = document.createElement("span");
        nick.className = "mb-4 text-2xl font-bold";
        nick.textContent = `${DOMPurify.sanitize(stateProxyHandler.profile.username)}`;
        const wins = document.createElement("span");
        wins.textContent = `WINS: ${matchesHistory.wins}`;
        const loses = document.createElement("span");
        loses.textContent = `LOSES: ${matchesHistory.loses}`;
        profileName.appendChild(nick);
        profileName.appendChild(wins);
        profileName.appendChild(loses);

        profileDiv.appendChild(profileAvatar);
        profileDiv.appendChild(profileName);

        // Buttons
        const buttonsDiv = document.createElement("div");
        buttonsDiv.className = "flex flex-col gap-10 mb-9";

        if (!isUserProfile) {
            const isFriend = stateProxyHandler.friendList?.some((friend) => friend.id === stateProxyHandler.selectChat?.id);
            const friendButton = document.createElement("button");
            friendButton.id = "btn-friend-list";
            friendButton.textContent = "Add Friend";
            friendButton.className = `px-10 py-4 rounded text-white ${isFriend ? "bg-gray-400 opacity-50 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`;
            friendButton.disabled = !!isFriend;
            buttonsDiv.appendChild(friendButton);

            const removeFriendButton = document.createElement("button");
            removeFriendButton.id = "btn-remove-friend";
            removeFriendButton.textContent = "Remove Friend";
            removeFriendButton.className = `px-10 py-4 rounded text-white ${isFriend ? "bg-red-500 hover:bg-red-600" : "bg-gray-400 opacity-50 cursor-not-allowed"}`;
            removeFriendButton.disabled = !isFriend;
            buttonsDiv.appendChild(removeFriendButton);

            const isBlocked = stateProxyHandler.chatBlockList?.includes(stateProxyHandler.selectChat?.id);
            const blockButton = document.createElement("button");
            blockButton.id = `${isBlocked ? "btn-unblock-user" : "btn-block-user"}`;
            blockButton.textContent = isBlocked ? "Unblock" : "Block";
            blockButton.className = `px-10 py-4 rounded text-white ${isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`;
            buttonsDiv.appendChild(blockButton);

            const inviteButton = document.createElement("button");
            inviteButton.id = "btn-invite-match";
            inviteButton.textContent = "Invite"
            inviteButton.className = "px-10 py-4 rounded text-white bg-yellow-500 hover:bg-yellow-600";
            buttonsDiv.appendChild(inviteButton);
        }
        else {
            const updateProfileButton = document.createElement("button");
            updateProfileButton.id = "update-profile";
            updateProfileButton.textContent = "Update Profile";
            updateProfileButton.className = "px-10 py-4 rounded text-white bg-blue-500 hover:bg-blue-600";
            buttonsDiv.appendChild(updateProfileButton);
        }

        profileContainer.appendChild(profileDiv);
        profileContainer.appendChild(buttonsDiv);

        middleParent.appendChild(profileContainer);

        // ================================================================== //
        //     Lower Section (Match History)                                  //
        // ================================================================== //

        const matchContainer = document.createElement("div");
        matchContainer.className = "flex flex-col justify-start items-center w-full";

        // Header
        const matchHeader = document.createElement("div");
        matchHeader.className = "flex items-center justify-center border-5 border-[#424549] text-white w-full";
        matchHeader.textContent = `${DOMPurify.sanitize(stateProxyHandler.profile.username)}` + "'s MATCHES";
        middleParent.appendChild(matchHeader);

        // Matches
        const matchListWrapper = document.createElement("div");
        matchListWrapper.className = "w-full max-h-140 overflow-y-auto";

        const matchList = document.createElement("ul");
        matchList.className = "text-white text-xl font-bold mb-4";

        if (matchesHistory.history.length === 0) {
            const emptyList = document.createElement("li");
            emptyList.textContent = "NO MATCH HAS BEEN REGISTERED";
            emptyList.className = "text-gray-300 text-center";
            matchList.appendChild(emptyList);
        } else {
            matchesHistory.history.forEach(match => {
                const li = document.createElement("li");
                li.className = "p-2 flex gap-2 justify-center items-center";

                const dateSpan = document.createElement("span");
                dateSpan.textContent = new Date(match.createdAt).toLocaleDateString() + " - ";
                const p1Span = document.createElement("span");
                p1Span.textContent = match.player1;
                const s1Span = document.createElement("span");
                s1Span.textContent = match.score1.toString();
                s1Span.className = match.score1 > match.score2 ? "text-green-500" : "text-red-500";
                const vsSpan = document.createElement("span");
                vsSpan.textContent = "X";
                const p2Span = document.createElement("span");
                p2Span.textContent = match.player2;
                const s2Span = document.createElement("span");
                s2Span.textContent = match.score2.toString();
                s2Span.className = match.score2 > match.score1 ? "text-green-500" : "text-red-500";

                li.append(dateSpan, p1Span, s1Span, vsSpan, p2Span, s2Span);
                matchList.appendChild(li);
                });
        }

        matchListWrapper.appendChild(matchList);
        matchContainer.appendChild(matchListWrapper);
        middleParent.appendChild(matchContainer);
    }

	onRender();
	onStateChange("profile", onRender);
	onStateChange("matchesHistory", onRender);
	onStateChange("chatBlockList", onRender);

    // ====================================================================== //
    //                                                                        //
    //                               Right Part                               //
    //                                                                        //
    // ====================================================================== //

    const rightParent = document.createElement("div");
    rightParent.id = "right-parent";
    rightParent.className = "border-10 border-l-5 border-[#1e2124] flex flex-col flex-1 shrink-0 h-full bg-[#282b30]";

    // ====================================================================== //
    //     Upper Section (View Profile + Disconnect)                          //
    // ====================================================================== //

    // Header
    const optionsHeader = document.createElement("div");
    optionsHeader.className = "w-full flex items-center justify-center border-5 border-[#424549] text-white";
    optionsHeader.textContent = "MENU";
    rightParent.appendChild(optionsHeader);

    // Buttons
    const menuButtonContainer = document.createElement("div");
    menuButtonContainer.className = "flex justify-evenly w-full mt-6 mb-6";

    const viewProfileButton = document.createElement("button");
    viewProfileButton.id = "view-profile";
    viewProfileButton.textContent = "View Profile";
    viewProfileButton.className = "px-10 py-4 rounded text-white bg-blue-500 hover:bg-blue-600";

    const logoutButton = document.createElement("button");
    logoutButton.id = "btn-logout";
    logoutButton.textContent = "Disconnect";
    logoutButton.className = "px-10 py-4 rounded text-white bg-red-500 hover:bg-red-600";

    menuButtonContainer.appendChild(viewProfileButton);
    menuButtonContainer.appendChild(logoutButton);
    rightParent.appendChild(menuButtonContainer);

    // ====================================================================== //
    //     Middle Section (Game List)                                         //
    // ====================================================================== //

    // Header
    const gameListHeader = document.createElement("div");
    gameListHeader.className = "w-full flex items-center justify-center border-5 border-[#424549] text-white";
    gameListHeader.textContent = "GAMES";
    rightParent.appendChild(gameListHeader);

    const gameListWrapper = document.createElement("div");
    gameListWrapper.className = "flex-1 overflow-y-auto min-h-0 p-4";
    rightParent.appendChild(gameListWrapper);

    function renderGameList() {
        gameListWrapper.innerHTML = MatchList();
    }
    renderGameList();

    onStateChange("availableMatches", renderGameList);
    onStateChange("state", renderGameList);

    // ====================================================================== //
    //     Lower Section (Create Match + Tournament)                          //
    // ====================================================================== //

    // Header
    const gameHeader = document.createElement("div");
    gameHeader.className = "w-full flex items-center justify-center border-5 border-[#424549] text-white";
    gameHeader.textContent = "CREATE A GAME";
    rightParent.appendChild(gameHeader);    

    // Buttons
    const gameButtonContainer = document.createElement("div");
    gameButtonContainer.className = "flex justify-evenly w-full mt-6 mb-6";

    const matchButton = document.createElement("button");
    matchButton.id = "create-match-btn";
    matchButton.textContent = "Create Match";
    matchButton.className = "px-10 py-4 rounded text-white bg-green-500 hover:bg-green-600 uppercase";

    const tournamentButton = document.createElement("button");
    tournamentButton.id = "tournament-btn";
    tournamentButton.textContent = "Join Tournament";
    tournamentButton.className = "px-10 py-4 rounded text-white bg-green-500 hover:bg-green-600 uppercase";

    gameButtonContainer.appendChild(matchButton);
    gameButtonContainer.appendChild(tournamentButton);
    rightParent.appendChild(gameButtonContainer);

    // ====================================================================== //
    //                                                                        //
    //                             Final Assembly                             //
    //                                                                        //
    // ====================================================================== //

    mainDiv.appendChild(leftParent);
    mainDiv.appendChild(middleParent);
    mainDiv.appendChild(rightParent);

    return mainDiv;
}
