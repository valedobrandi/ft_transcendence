import { profile } from "../app";
import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

export function ProfileButton(): HTMLDivElement {

    const isUserProfile = stateProxyHandler.chat.id === profile.id;

    const buttonsDiv = document.createElement("div");
    buttonsDiv.id = "profile-buttons";
    buttonsDiv.className = "flex flex-col gap-10 mb-9";

    function onRender() {
        buttonsDiv.innerHTML = "";

        if (!isUserProfile) {
            const isFriend = stateProxyHandler.friendList?.some((friend) => friend.id === stateProxyHandler.chat?.id);
            const friendButton = document.createElement("button");
            friendButton.id = "btn-friend-list";
            friendButton.textContent = "SEND A FRIEND REQUEST";
            friendButton.className = `px-10 py-4 rounded text-white text-base ${isFriend ? "bg-gray-400 opacity-50 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`;
            friendButton.disabled = !!isFriend;
            buttonsDiv.appendChild(friendButton);

            const removeFriendButton = document.createElement("button");
            removeFriendButton.id = "btn-remove-friend";
            removeFriendButton.textContent = "REMOVE FROM FRIENDS";
            removeFriendButton.className = `px-10 py-4 rounded text-white text-base ${isFriend ? "bg-red-500 hover:bg-red-600" : "bg-gray-400 opacity-50 cursor-not-allowed"}`;
            removeFriendButton.disabled = !isFriend;
            buttonsDiv.appendChild(removeFriendButton);

            const isBlocked = stateProxyHandler.chatBlockList?.includes(stateProxyHandler.chat?.id);
            const blockButton = document.createElement("button");
            blockButton.id = `${isBlocked ? "btn-unblock-user" : "btn-block-user"}`;
            blockButton.textContent = isBlocked ? "UNBLOCK USER MESSAGES" : "BLOCK USER MESSAGES";
            blockButton.className = `px-10 py-4 rounded text-white text-base ${isBlocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`;

            buttonsDiv.appendChild(blockButton);

            const inviteButton = document.createElement("button");
            inviteButton.id = "btn-invite-match";
            inviteButton.textContent = "INVITE TO A MATCH";
            inviteButton.className = "px-10 py-4 rounded text-white text-base bg-yellow-500 hover:bg-yellow-600";
            buttonsDiv.appendChild(inviteButton);
        }
        else {
            const updateProfileButton = document.createElement("button");
            updateProfileButton.id = "update-profile";
            updateProfileButton.textContent = "UPDATE YOUR PROFILE";
            updateProfileButton.className = "px-10 py-4 rounded text-white text-base bg-blue-500 hover:bg-blue-600";
            buttonsDiv.appendChild(updateProfileButton);
        }
    }
    onRender();
    onStateChange("chat", onRender);
    onStateChange("friendList", onRender);
    onStateChange("chatBlockList", onRender);
    return buttonsDiv;
}
