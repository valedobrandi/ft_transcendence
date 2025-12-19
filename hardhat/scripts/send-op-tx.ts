import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "hardhatOp",
  chainType: "op",
});

/////log("Sending transaction using the OP chain type");

const [sender] = await ethers.getSigners();

/////log("Sending 1 wei from", sender.address, "to itself");

/////log("Sending L2 transaction");
const tx = await sender.sendTransaction({
  to: sender.address,
  value: 1n,
});

await tx.wait();

/////log("Transaction sent successfully");
