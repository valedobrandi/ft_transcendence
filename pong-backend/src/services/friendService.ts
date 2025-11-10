import db from "../../database/db";
import FriendsModel from "../models/friendsModel";
import { connectedRoomInstance } from "../state/ConnectedRoom";

class FriendService {
	private friendModelInstance = new FriendsModel(db);

	getFriendsList(userId: number) {
		const { status, data } = this.friendModelInstance.getFriendsList(userId);
		if (status === 'error') {
			return { status, data };
		}
		connectedRoomInstance.playerFriendSet().save(userId.toString(), data);
		return { status, data };
	}

	addFriend(userId: number, friendId: number) {
		const { status, data } = this.friendModelInstance.addFriend(userId, friendId);
		if (status === 'error') {
			return { status, data };
		}
		connectedRoomInstance.playerFriendSet().add(userId.toString(), friendId);
		return { status, data };
	}

	removeFriend(userId: number, friendId: number) {
		const { status, data } = this.friendModelInstance.removeFriend(userId, friendId);
		if (status === 'error') {
			return { status, data };
		}
		connectedRoomInstance.playerFriendSet().delete(userId.toString(), friendId);
		return { status, data };
	}
}

export { FriendService };