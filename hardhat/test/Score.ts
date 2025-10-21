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

  let contract: any;
  let player1: any, player2: any;

  beforeEach(async function () {
    const TournamentScores = await ethers.getContractFactory("TournamentScores");
    contract = await TournamentScores.deploy();
    await contract.waitForDeployment();

    [player1, player2] = await ethers.getSigners();
  });

  it("should allow a player to submit and retrieve a score", async function () {
    await contract.connect(player1).submitScore(200);
    const [points, timestamp] = await contract.getLatestScore(player1.address);
    expect(points).to.equal(200);
    expect(timestamp).to.be.gt(0);
  });

  it("should store multiple scores for a player", async function () {
    await contract.connect(player1).submitScore(100);
    await contract.connect(player1).submitScore(150);

    const scores = await contract.getScore(player1.address);
    expect(scores.length).to.equal(2);
    expect(scores[0].points).to.equal(100);
    expect(scores[1].points).to.equal(150);
  });

  it("should handle multiple players independently", async function () {
    await contract.connect(player1).submitScore(111);
    await contract.connect(player2).submitScore(222);

    const [p1Score] = await contract.getLatestScore(player1.address);
    const [p2Score] = await contract.getLatestScore(player2.address);

    expect(p1Score).to.equal(111);
    expect(p2Score).to.equal(222);
  });

  it("should revert when getting latest score with no submissions", async function () {
    await expect(contract.getLatestScore(player1.address)).to.be.revertedWith("No scores found");
  });

  function timeRange(expected: bigint, delta: bigint = 2n) {
    return (actual: bigint) =>
      actual >= expected - delta && actual <= expected + delta;
  }

  it("should emit ScoreSubmitted event", async function () {
    await expect(contract.connect(player1).submitScore(300))
      .to.emit(contract, "ScoreSubmitted")
      .withArgs(player1.address, 300, timeRange(BigInt(await getBlockTimestamp())));
  });

  // Helper to get the current block timestamp
  async function getBlockTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});
