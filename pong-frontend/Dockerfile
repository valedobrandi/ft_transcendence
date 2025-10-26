FROM node:22.12.0 
WORKDIR /app

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
