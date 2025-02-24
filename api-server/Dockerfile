FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./ ./

RUN npm run build

FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
RUN npm install

COPY --from=builder /app/dist /app/dist

EXPOSE 3080

CMD [ "npm", "run", "start" ]
