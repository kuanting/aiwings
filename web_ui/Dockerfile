# --------------------------------------------------------------------
# 第一階段: 創建 【構建應用程序】
# --------------------------------------------------------------------
# 使用Node.js 的 lts-alpine 版本作為基礎映像【基於輕量級的 Alpine Linux 發行版】，並設置別名builder
# 別名用於紀錄這個階段的輸出結果，可被拷貝到下個階段，有助於減小最終映像的大小。
FROM node:lts-alpine AS build-stage

# 設定之後docker執行的指令，會基於"容器內"的哪個資料夾【如果沒有就創建一個】
# make the 'app' folder the current working directory
WORKDIR /app
# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./
# install project dependencies leaving out dev dependencies
RUN npm install 
# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# 不論專案修改期間為何ip，打包時都使用http://localhost:3080
ENV VITE_APP_BACKEND_SERVICE_PROTOCOL=http
ENV VITE_APP_BACKEND_SERVICE_SERVICE_HOST=localhost
ENV VITE_APP_BACKEND_SERVICE_SERVICE_PORT=3080

# build app for production with minification
RUN npm run build

# RUN apk update
# RUN apk add xdg-utils
# CMD ["npm", "run", "dev"]

# --------------------------------------------------------------------
# 第二階段: 生產【拷貝第一階段的輸出並用nginx打包，創建一個較小的映像】
# --------------------------------------------------------------------
FROM nginx:stable-alpine AS production-stage

# 複製上個階段產出的靜態網頁資料夾到這個階段，並放置到nginx讀取網頁的資料夾位置
# COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/dist /app/dist

# 複製本地資料夾的SSL證書，到此階段nginx放置ssl證書的地方
COPY ./SSL/certificate.crt /etc/nginx/ssl/
COPY ./SSL/private.key /etc/nginx/ssl/

# 複製本地資料夾的自定義nginx配置，
COPY ./nginx_config/nginx.conf /etc/nginx/nginx.conf
# COPY /etc/nginx/nginx.conf /etc/nginx/nginx.conf

# 複製複合指令文件
COPY ./CMD_shell/dockerfile_cmd.sh /

# 設定默認環境變數
ENV URL_FRONTEND=localhost
ENV URL_BACKEND=localhost
# URL_BACKEND默認值，僅在後端是在本地執行(不是用docker image建立)時才可用，且本地執行時，後端預設入口為http://ocalhost:3080

# 暴露Nginx的默認端口80
EXPOSE 80
# 暴露HTTPS端口
EXPOSE 443

# 在容器啟動時執行此檔案中的指令
CMD ["sh", "dockerfile_cmd.sh"]
