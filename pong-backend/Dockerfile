FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

RUN mkdir -p /app/database/

RUN npx tsx /app/src/database/init.ts 

EXPOSE 3000

CMD ["sh", "-c", "npm run dev"]

