import Database from 'better-sqlite3'

export type FriendsTableModel = {
	friend_id: number;
}

export type GetFriendsList = {
	status: 'success' | 'error';
	data: number[] | [];
}

export type AddFriend = {
	status: 'success' | 'error';
	data: {};
}

export type RemoveFriend = {
	status: 'success' | 'error';
	data: {};
}

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

	getFriendsList(userId: number): GetFriendsList {
		const response =  this.stmGetFriendsList.all(userId) as FriendsTableModel[];
		if (response.length === 0) {
			return { status: 'error', data: [] };
		}
		return { status: 'success',data: response.map(row => row.friend_id) };
	}

	addFriend(userId: number, friendId: number): AddFriend  {
		const response = this.stmAddFriend.run(userId, friendId);
		if (response.changes === 0) {
			return { status: 'error', data: {} };
		}
		return { status: 'success', data: {} };
	}

	removeFriend(userId: number, friendId: number): RemoveFriend {
		const response = this.stmRemoveFriend.run(userId, friendId);
		if (response.changes === 0) {
			return { status: 'error', data: {} };
		}
		return { status: 'success', data: {} };
	}
}

export default FriendsModel;