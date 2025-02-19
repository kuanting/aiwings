FROM node:lts-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install 

COPY . .
RUN npm run build

FROM busybox:1.37

COPY --from=builder /app/dist .
EXPOSE 80

CMD ["busybox", "httpd", "-f", "-v"]
