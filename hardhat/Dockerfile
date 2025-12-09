FROM node:22-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    git \
    curl \
    jq \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --verbose

COPY . .

EXPOSE 8545
EXPOSE 3300

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]