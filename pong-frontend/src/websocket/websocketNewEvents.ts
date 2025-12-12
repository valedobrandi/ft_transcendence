import { EmbeddedButton } from "../components/EmbeddedButton";
import { newIntraMessage, stateProxyHandler } from "../states/stateProxyHandler";
import { fetchRequest } from "../utils";


async function websocketNewEvents() {
	const { message, data } = await fetchRequest('/to-events', 'GET');
	//console.log('Fetch New-Events: ', data);
	if (message === 'success') {
		for (const event of data) {


			switch (event.type) {
				case 'friend:add':
					const getSender = stateProxyHandler.serverUsers
						.find(({ id }) => Number(id) === Number(event.from_id));
					if (getSender === undefined) break;


					const idx = newIntraMessage(
						`${getSender.name} has send a friend request`
					);

					const acceptBtn = EmbeddedButton(getSender.id, "YES", event.id, `${idx}`, "accept-friend");
					const denyBtn = EmbeddedButton(getSender.id, "NO", event.id, `${idx}`, "deny-friend");

					stateProxyHandler.systemMessages = [...stateProxyHandler.systemMessages.slice(0, -1), {
						message: `${stateProxyHandler.systemMessages[stateProxyHandler.systemMessages.length - 1].message}
						${acceptBtn} ${denyBtn}`,
						index: idx,
					}];
					break;
			}
		}
		return { message: 'success', data: data.id };
	}
	return { message: 'error', data: -1 };
}

export { websocketNewEvents };

