FROM mcr.microsoft.com/playwright:v1.56.0-jammy

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Install timezone (optional)
RUN apt-get update && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Run Playwright tests in headless mode
# CMD ["npx", "playwright", "test" ]
