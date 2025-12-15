import { stateProxyHandler } from "../states/stateProxyHandler";
import { fetchRequest } from "../utils";


async function websocketNewEvents() {
	const { message, data } = await fetchRequest('/to-events', 'GET');
	console.log('Fetch New-Events: ', data);
	if (message === 'success') {
		const newFriendList = [];
		for (const event of data) {
			switch (event.type) {
				case 'friend:add':
					const username = stateProxyHandler.serverUsers
						.find(({ id }) => Number(id) === Number(event.from_id));
					if (username === undefined) continue;
					newFriendList.push({
						id: event.from_id,
						username: username.name,
						eventId: event.id,
					});
					break;
			}
		}
		stateProxyHandler.friendRequests = newFriendList;
	}
}

export { websocketNewEvents };

