FROM node:22.12.0 As playwright

WORKDIR /app

RUN npx playwright install-deps && npx playwright install --with-deps

FROM playwright As builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM builder As dev

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
