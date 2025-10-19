import { ChatType } from "../types.js";
import { connectedRoom } from "../../state/connectedRoom.js";

export function CHAT(data: ChatType) {

    const to = connectedRoom.get(data.receiver);

    const from = connectedRoom.get(data.sender);

    if (!from || !to) return

    to.chat.sendMessage(data.sender, data.message, data.sender);

    from.chat.sendMessage(data.receiver, data.message, data.sender);


}