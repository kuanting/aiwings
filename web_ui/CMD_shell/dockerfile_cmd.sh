# shell 脚本
# dockerfile中，只有最後一個CMD會生效，所以如果要多個指令，必須用shell腳本


#!/usr/bin/env sh

# 替換前端URL，改為https協議，自定義的IP
find '/app/dist' -name '*.js' -exec sed -i -e 's,http://localhost:3080,'"https://$URL_FRONTEND"',g' {} \;
# 替換後端URL
sed -i -e 's,backend_url,'"$URL_BACKEND"',g' /etc/nginx/nginx.conf;
# 在容器啟動時自動啟動 Nginx
nginx -g "daemon off;"


# find '/usr/share/nginx/html' -name '*.js' 
# 到所有'/usr/share/nginx/html'查找所有.js'的文件

# -exec
# 指定 find 命令在找到匹配的檔案時執行的指令。

# sed -i -e 's,API_BASE_URL,'"$API_BASE_URL"',g' {} \;
# 使用 sed 將API_BASE_URL替換為環境變數 $USER_INPUT_URL 的值。
#   # sed ：Linux sed 指令是利用腳本來處理文字檔。
#   # -i  ：告訴 sed 在原始檔案上進行直接編輯，而不是在標準輸出中顯示結果。
#   # -e  ：指定後面的內容作為 sed 執行的命令。
#   # 's,API_BASE_URL,'"$API_BASE_URL"',g' ：是 sed 的替換表達式【s ：取代】
#   # {}  ：find 命令找到的檔案的佔位符。

# \; 表示 -exec 指令的結束。