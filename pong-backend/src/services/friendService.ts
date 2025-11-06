import db from "../../database/db";
import FriendsModel from "../models/friendsModel";

class FriendService {
	private friendModelInstance = new FriendsModel(db);

	getFriendsList(userId: number): { friend_id: number }[] {
		return this.friendModelInstance.getFriendsList(userId);
	}

	addFriend(userId: number, friendId: number): void {
		this.friendModelInstance.addFriend(userId, friendId);
	}

	removeFriend(userId: number, friendId: number): void {
		this.friendModelInstance.removeFriend(userId, friendId);
	}
}

export { FriendService };