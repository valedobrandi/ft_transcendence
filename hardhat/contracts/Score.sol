// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TournamentScores {
	struct MatchResult {
		uint256 score1;
		uint256 score2;
		uint256 timestamp;
	}

	mapping(string => MatchResult) private matches;

	event MatchSaved(string matchId, uint256 score1, uint256 score2, uint256 timestamp);

	function saveMatch(string calldata matchId, uint256 score1, uint256 score2) external {
		matches[matchId] = MatchResult({
			score1: score1,
			score2: score2,
			timestamp: block.timestamp
		});
		emit MatchSaved(matchId, score1, score2, block.timestamp);
	}

	function getMatch(string calldata matchId) external view returns (uint256 score1, uint256 score2, uint256 timestamp) {
		MatchResult memory m = matches[matchId];
		require(m.timestamp !=0, "Match not found");
		return (m.score1, m.score2, m.timestamp);
	}
}