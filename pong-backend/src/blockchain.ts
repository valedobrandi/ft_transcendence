import { ethers } from 'ethers';
import fs from "fs";
import path from "path";

const artifactPath = path.resolve(
  __dirname,
  "artifacts/contracts/TournamentScores.sol/TournamentScores.json"
);
if (!fs.existsSync(artifactPath)) {
  throw new Error(
	`Artifact file not found at path: ${artifactPath}.`
  );
}

const artifact = JSON.parse(
  fs.readFileSync(artifactPath, "utf8")
);

const contractAddress = process.env.CONTRACT_ADDRESS;

if (!contractAddress ) {
  throw new Error(
	`Missing CONTRACT_ADDRESS environment variable.`
  );
} 

const URL = process.env.RPC_URL || "http://hardhat:8545";

const provider = new ethers.JsonRpcProvider(URL);


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
