import { expect } from "chai";
import { network } from "hardhat";

let ethers: typeof import("hardhat").ethers;

describe("TournamentScores contract", function () {
  before(async function () {
    const result = await network.connect({
      network: "hardhatOp",
      chainType: "op",
    });
    ethers = result.ethers;
  });

  it("should allow a player to submit and retrieve a score", async function () {
    const TournamentScores = await ethers.getContractFactory("TournamentScores");
    const contract = await TournamentScores.deploy();
    await contract.waitForDeployment();

    const [player] = await ethers.getSigners();
    const tx = await contract.connect(player).submitScore(200);
    await tx.wait();

    const [points, timestamp] = await contract.getLatestScore(player.address);
    expect(points).to.equal(200);
    expect(timestamp).to.be.gt(0);
  });
});
