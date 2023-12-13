FROM node:lts-alpine

WORKDIR /app

COPY package*.json  /app/

RUN npm install

COPY ./ /app/

# ------------------------------------------------------------------
# 設定默認環境變數
ENV BACKEND_SERVICE_SERVICE_PORT=3080

# # for 測試用
# ENV FRONTEND_URL=http://localhost:5173

ENV RABBITMQ_SERVICE_SERVICE_HOST=127.0.0.1
ENV RABBITMQ_SERVICE_SERVICE_PORT=5672
ENV RABBITMQ_SERVICE_USER=guest
ENV RABBITMQ_SERVICE_PASSWORD=guest

ENV MYSQL_SERVICE_SERVICE_HOST=127.0.0.1
ENV MYSQL_SERVICE_SERVICE_PORT=3306
ENV MYSQL_SERVICE_USER=root
ENV MYSQL_SERVICE_PASSWORD=password

ENV JWT_TOKEN_SECRET=littleSecret
ENV TLS_KEY="for_production_use(no need to set during dev)"
ENV TLS_CERT="for_production_use(no need to set during dev)"
# ------------------------------------------------------------------

EXPOSE 3080


CMD [ "npm", "run", "dev" ]

# CMD [ "npm",  "start" ]
