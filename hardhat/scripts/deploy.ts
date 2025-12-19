import fs from "fs";
import { network } from "hardhat";

async function main() {
	const { ethers } = await network.connect();

	const tournamentScore = await ethers.deployContract("TournamentScores");

	/////log("Waiting for the deployment tx to confirm");
	await tournamentScore.waitForDeployment();

	/////log("Counter address:", await tournamentScore.getAddress());


	const tx = await tournamentScore.saveMatch("matchId", 5, 3);
	await tx.wait();

	const [score1, score2] = await tournamentScore.getMatch("matchId");
	/////log(`Scores for matchId: ${score1} - ${score2}`);

	const address = await tournamentScore.getAddress();

	/////log(`Contract deployed to address: ${address}`);
}

main().catch((error) => {
	///error(error);
	process.exitCode = 1;
});
