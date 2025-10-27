FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npm", "run", "dev"]
