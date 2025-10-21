#!/bin/sh

# Start Hardhat node in background
npx hardhat node --hostname 0.0.0.0 &

# Wait a few seconds for node to be ready
sleep 5

# Deploy TournamentScores contract
npx hardhat run scripts/TournamentScores.ts --network localhost

# Keep the container running
wait
