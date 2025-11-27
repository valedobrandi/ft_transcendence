import fs from "fs";
import { network } from "hardhat";

const { ethers } = await network.connect({
	network: "hardhatOp",
	chainType: "op",
});


async function main() {
	const [deployer] = await ethers.getSigners();

	console.log(
		`Deploying contracts with the account: ${deployer.address}`
	);

	const TournamentMatches = await ethers.getContractFactory("TournamentMatches");

	const contract = await TournamentMatches.deploy();
	await contract.waitForDeployment();

	console.log(
		`TournamentMatches deployed to: `, await contract.getAddress();
	);


	fs.writeFileSync(
		"./hardhat/scripts/TournamentMatches.local.json",
		JSON.stringify({ address: await contract.getAddress() }, null, 2)
	);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

