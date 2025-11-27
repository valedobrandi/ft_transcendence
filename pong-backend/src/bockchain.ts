import { ethers } from 'ethers';
import TournamentMatchersArtifact from "../artifacts/contracts/Score.sol/TournamentScores.json";
import contractData from "../deployed/TournamentMatches.local.json";

const URL = process.env.RPC_URL || "http://blockchain:8545";

const provider = new ethers.JsonRpcProvider(URL);

const signer = new ethers.Wallet(
	"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
	provider
);

export const contractWithSigner = new ethers.Contract(
	contractData.address,
	TournamentMatchersArtifact.abi,
	signer
);

export const contractReadOnly = new ethers.Contract(
	contractData.address,
	TournamentMatchersArtifact.abi,
	provider
);