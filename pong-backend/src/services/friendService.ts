import db from "../../database/db";
import FriendsModel from "../models/friendsModel";
import { EventsModel } from "../routes/events";
import { connectedRoomInstance } from "../state/ConnectedRoom";

class FriendService {
	private friendModelInstance = new FriendsModel(db);
	private eventsModelInstance = new EventsModel(db);

	getFriendsList(userId: number) {
		const { status, data } = this.friendModelInstance.getFriendsList(userId);
		connectedRoomInstance.friendListSet(userId).save(data);
		return { status, data };
	}

	addFriend(userId: number, friendId: number) {
		const { status, data } = this.eventsModelInstance
			.insertEvent('friend_added_request', userId, friendId, '');
			
		return { status, data };
	}

	removeFriend(userId: number, friendId: number) {
		const { status, data } = this.friendModelInstance.removeFriend(userId, friendId);
		connectedRoomInstance.friendListSet(userId).delete(friendId);
		return { status, data };
	}
}

export { FriendService };