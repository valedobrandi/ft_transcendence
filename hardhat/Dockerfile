FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm ci

COPY . .

EXPOSE 8545

RUN chmod +x hardhat-entrypoint.sh

CMD ["./hardhat-entrypoint.sh"]
