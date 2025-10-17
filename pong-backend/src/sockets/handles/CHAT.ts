import { ChatType } from "../types.js";
import { connectedRoom } from "../../state/connectedRoom.js";

export function CHAT(data: ChatType) {

    const from = connectedRoom.get(data.from);
    const to = connectedRoom.get(data.to);

    if (!from || !to) return

    from.chat.sendMessage(data.from, data.message);
    from.chat.sendMessage(data.to, data.message);
    
}