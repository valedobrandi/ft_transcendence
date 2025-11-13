import { addIntraMessage, messageState } from "../states/messageState";
import { fetchRequest } from "../utils";

function btnLink(friendId: number, text: string, eventId: number): string {
	const btnBg = text === "YES" ? "bg-green-500" : "bg-red-500";
	return (
		`<button
			id="accept-friend-request"
			name="${friendId}"
			eventid="${eventId}"
			class="${btnBg} text-white ml-4 p-1 rounded text-xs"
		>
			${text}
		</button>`
	)
}

async function websocketNewEvents() {
	const { status, data } = await fetchRequest('/to-events', 'GET');
	console.log('Fetch New-Events: ', data);
	if (status === 'success') {
		for (const event of data) {

			const { type, from_id, id: eventId } = event;

			switch (type) {
				case 'friend:add':
					const getSender = messageState.serverUsers
						.find(({ id }) => Number(id) === Number(from_id));
					if (getSender === undefined) break;
					addIntraMessage(
						`${getSender.name} has send a friend request
							 	${btnLink(getSender.id, "YES", eventId)}
							 		${btnLink(getSender.id, "NO", eventId)}`
					);
					break;
				case 'friend:accepted':
					addIntraMessage(`Your friend request has been accepted.`);
					const response = await fetchRequest('/add-friend', 'POST', {},
						{ body: JSON.stringify({ id: from_id }) })
					if (response.status === 'success') {
						messageState.friendList = response.data;
						await fetchRequest(`/delete-event?eventId=${eventId}`, 'DELETE');
					}
					break;
				default:
					break;
			}
		}
		return { status: 'success', data: data.id };
	}
	return { status: 'error', data: -1 };
}

export { websocketNewEvents };

