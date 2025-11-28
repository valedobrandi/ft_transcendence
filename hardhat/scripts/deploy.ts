import fs from "fs";
import { network } from "hardhat";

async function main() {
	const { ethers, networkName } = await network.connect();

	const tournamentScore = await ethers.deployContract("TournamentScores");

	console.log("Waiting for the deployment tx to confirm");
	await tournamentScore.waitForDeployment();

	console.log("Counter address:", await tournamentScore.getAddress());


	const tx = await tournamentScore.saveMatch("matchId", 5, 3);
	await tx.wait();

	const result = await tournamentScore.getMatch("match1");
	console.log("Match result:", result);

	fs.writeFileSync(
		"./deployed/TournamentScores.local.json",
		JSON.stringify({ address: await tournamentScore.getAddress() }, null, 2)
	);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

/* const { network } = await import("hardhat"); */