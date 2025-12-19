import {contractReadOnly , contractWithSigner } from "./blockchain.js";

async function main() {

  try {
    // Try saving a match
    const tx = await contractWithSigner.saveMatch("test-match-1", 3, 5);
    await tx.wait();
    /////log("Match saved on blockchain.");

    // Try reading the match
    const result = await contractReadOnly.getMatch("test-match-1");
    /////log("Match fetched from blockchain:", result);
  } catch (err) {
    ///error("Error interacting with contract:", err);
  }
}

main();
