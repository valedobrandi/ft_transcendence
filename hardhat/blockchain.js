import { ethers } from 'ethers';
import fs from "fs";

const artifact = JSON.parse(
  fs.readFileSync("/app/ignition/deployments/chain-31337/artifacts/TournamentScoresModule#TournamentScores.json", "utf8")
);

const contractData = JSON.parse(
  fs.readFileSync("/app/ignition/deployments/chain-31337/deployed_addresses.json", "utf8")
);

const URL = process.env.RPC_URL || "http://localhost:8545";

const provider = new ethers.JsonRpcProvider(URL);


export const contractAddress = contractData["TournamentScoresModule#TournamentScores"];

export const contractReadOnly = new ethers.Contract(
	contractAddress,
	artifact.abi,
	provider
);

const privateKey = process.env.HARDHAT_PRIVATE_KEY;
const signer = new ethers.Wallet(
	privateKey,
	provider
);

export const contractWithSigner = new ethers.Contract(
	contractAddress,
	artifact.abi,
	signer
);
