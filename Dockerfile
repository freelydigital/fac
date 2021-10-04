FROM node:14

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install
RUN npm run build

VOLUME /app/upload
RUN mkdir -p /app/tmp

EXPOSE 3000


ENV PORT=3000
ENV NODE_ENV=production

cmd ["node", "./dist/server.js"]
