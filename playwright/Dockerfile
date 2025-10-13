FROM mcr.microsoft.com/playwright:v1.56.0-jammy

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /tests
COPY . .

# Install timezone (optional)
RUN apt-get update && \
    apt-get install -y tzdata && \
    ln -fs /usr/share/zoneinfo/Europe/Paris /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Run Playwright tests in headless mode
CMD ["npx", "playwright", "test", "--trace", "on"]
