FROM node:22.10.0-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8545

CMD ["sh", "-c", "
  echo 'Starting Hardhat node...' &&
  npx hardhat node > /app/hardhat.log 2>&1 &

  echo 'Waiting for Hardhat RPC to be ready...' &&
  until curl -s http://localhost:8545 > /dev/null; do sleep 1; done

  echo 'Deploying contracts via Ignition...' &&
  npx hardhat ignition deploy ignition/modules/TournamentScores.js --network localhost

  echo 'Hardhat node and contracts ready, keeping node running...' &&
  wait
"]
