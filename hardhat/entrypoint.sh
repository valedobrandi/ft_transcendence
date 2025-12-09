#!/bin/sh
set -e

echo "➡️ Starting Hardhat node..."
npx hardhat node &
# wait for RPC to become available
sleep 3

echo "➡️ Cleaning + compiling contracts..."
npx hardhat clean
npx hardhat compile

echo "➡️ Deploying contract with Ignition..."
npx hardhat ignition deploy ignition/modules/TournamentScores.js --network localhost

echo "➡️ Starting Fastify server..."
node server.js
