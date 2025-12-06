import { ethers } from 'ethers';
import fs from "fs";

const artifact = JSON.parse(
  fs.readFileSync("/app/ignition/deployments/chain-31337/artifacts/TournamentScoresModule#TournamentScores.json", "utf8")
);
const contractData = JSON.parse(
  fs.readFileSync("/app/ignition/deployments/chain-31337/deployed_addresses.json", "utf8")
);

const URL = process.env.RPC_URL || "http://hardhat:8545";

const provider = new ethers.JsonRpcProvider(URL);


export const contractAddress = contractData["TournamentScoresModule#TournamentScores"];
export const contractReadOnly = new ethers.Contract(
	contractAddress,
	artifact.abi,
	provider
);


const signer = new ethers.Wallet(
	"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
	provider
);

export const contractWithSigner = new ethers.Contract(
	contractAddress,
	artifact.abi,
	signer
);
