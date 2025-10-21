import { expect } from "chai";
import { ethers } from "hardhat";

describe("TournamentScores contract", function () {
  it("should allow a player to submit and retrieve a score", async function () {
    // 1. Deploy the contract
    const TournamentScores = await ethers.getContractFactory("TournamentScores");
    const contract = await TournamentScores.deploy();
    await contract.waitForDeployment();

    // 2. Get a test signer (pre-funded account)
    const [player] = await ethers.getSigners();

    // 3. Submit a score
    const tx = await contract.connect(player).submitScore(200);
    await tx.wait();

    // 4. Retrieve the latest score
    const [points, timestamp] = await contract.getLatestScore(player.address);

    expect(points).to.equal(200);
    expect(timestamp).to.be.gt(0);

    console.log("Score submitted and retrieved successfully!");
  });
});
