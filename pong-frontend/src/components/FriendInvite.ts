import { onStateChange, stateProxyHandler } from "../states/stateProxyHandler";

export function FriendInvite(): HTMLElement {
    const root = document.createElement("div");
    root.className = "absolute top-4 left-4 z-50 flex flex-col space-y-4 pointer-events-auto";
    
    function onRender() {
        if (stateProxyHandler.settings.state !== '0') {
            root.innerHTML = "";
            return;
        }
        const state = stateProxyHandler.friendRequests;  
        console.log("Rendering Friend Invites:", state);
        root.innerHTML = `
        ${state.map(request => {
            return `
                <div class="w-80 sm:w-96 rounded-lg shadow-xl bg-white">
                <!-- Card Content -->
                    <div class="px-4 pt-5 pb-4">
                        <div class="flex items-start gap-4">
                            <div class="flex size-12 items-center justify-center rounded-full bg-red-100">
                                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 18-7 3 7-18 7 18-7-3Zm0 0v-5"/>
                                </svg>
                            </div>

                            <div>
                                <h3 id="dialog-title" class="text-2xl font-semibold text-gray-900">${request.username}</h3>
                                <div class="mt-2">
                                    <p class="text-black text-lg">
                                        You have received a friend request.
                                    </p>
                                    <p class="text-black underline text-lg mt-2">
                                        Would you like to accept it?  
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button 
                                class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-700 sm:ml-3 sm:w-auto"
                                type="button"
                                data-action="deny-friend"
                                data-eventid="${request.eventId}"
                                data-userid="${request.id}"
                            >
                                    NO
                            </button>
                            <button 
                            class="mt-3 inline-flex w-full justify-center rounded-md bg-green-400 px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-green-500 sm:mt-0 sm:w-auto"
                                type="button" 
                                data-action="accept-friend"
                                data-eventid="${request.eventId}"
                                data-userid="${request.id}"
                            >
                                    YES
                            </button>
                        </div>
                    </div>
                </div>`
        }).join('')}`;
    }
    onRender();
    onStateChange("friendRequests", onRender);
    return root;
}
