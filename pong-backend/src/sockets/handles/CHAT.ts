import { connectedRoomInstance } from "../../state/connectedRoom.js";
import { ChatType } from "../types.js";

export function CHAT(data: ChatType) {

    const to = connectedRoomInstance.getById(data.receiver);

    const from = connectedRoomInstance.getById(data.sender);

    if (!from || !to) return

    to.chat.sendMessage(data.sender, data.message, data.sender);

    from.chat.sendMessage(data.receiver, data.message, data.sender);


}