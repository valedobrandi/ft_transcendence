import Database from 'better-sqlite3'

class FriendsModel {
	private db: Database.Database;
	private stmGetFriendsList: Database.Statement;
	private stmAddFriend: Database.Statement;
	private stmRemoveFriend: Database.Statement;

	constructor(db: Database.Database) {
		this.db = db;
		this.stmGetFriendsList = db.prepare('SELECT friend_id FROM friends WHERE user_id = ?');
		this.stmAddFriend = db.prepare('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)');
		this.stmRemoveFriend = db.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?');
	}

	getFriendsList(userId: number): { friend_id: number }[] {
		return this.stmGetFriendsList.all(userId);
	}

	addFriend(userId: number, friendId: number): void {
		this.stmAddFriend.run(userId, friendId);
	}

	removeFriend(userId: number, friendId: number): void {
		this.stmRemoveFriend.run(userId, friendId);
	}
}

export default FriendsModel;