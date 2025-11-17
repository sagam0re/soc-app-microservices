FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build && npm prune --omit=dev

EXPOSE 3004

CMD ["node", "dist/server.js"]