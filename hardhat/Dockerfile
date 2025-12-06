FROM node:22.10.0-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ git curl jq

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8545

CMD ["npx",  "hardhat",  "node"]
