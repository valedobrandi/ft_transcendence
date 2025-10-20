// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TournamentScores {
	struct Score {
		uint256 timestamp;
		uint256 points;
	}

	mapping(address => Score[]) private playerScores;

	event ScoreSubmitted(address indexed player, uint256 points, uint256 timestamp);

	function submitScore(uint256 _points) external {
		Score memory newScore = Score({
			timestamp: block.timestamp,
			points: _points
		});

		playerScores[msg.sender].push(newScore);
		emit ScoreSubmitted(msg.sender, _points, block.timestamp);
	}

	function getScore(address _player) external view returns (Score[] memory) {
		return playerScores[_player];
	}

	function getLatestScore(address _player) external view returns (uint256 points, uint256 timestamp) {
		uint256 len = playerScores[_player].length;
		require(len > 0, "No scores found");
		Score memory latest = playerScores[_player][len-1];
		return (latest.points, latest.timestamp);
	}
}