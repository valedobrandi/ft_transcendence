import { EmbeddedButton } from "../components/EmbeddedButton";
import { newIntraMessage, stateProxyHandler } from "../states/stateProxyHandler";
import { fetchRequest } from "../utils";


async function websocketNewEvents() {
	const { status, data } = await fetchRequest('/to-events', 'GET');
	console.log('Fetch New-Events: ', data);
	if (status === 'success') {
		for (const event of data) {

			const { type, from_id, id: eventId } = event;

			switch (type) {
				case 'friend:add':
					const getSender = stateProxyHandler.serverUsers
						.find(({ id }) => Number(id) === Number(from_id));
					if (getSender === undefined) break;
					newIntraMessage(
						`${getSender.name} has send a friend request
							 	${EmbeddedButton(getSender.id, "YES", eventId, "accept-friend-request")}
							 		${EmbeddedButton(getSender.id, "NO", eventId, "accept-friend-request")}`
					);
					break;
			}
		}
		return { status: 'success', data: data.id };
	}
	return { status: 'error', data: -1 };
}

export { websocketNewEvents };

