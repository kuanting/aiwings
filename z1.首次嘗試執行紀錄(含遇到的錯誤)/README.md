# 紀錄

## 安裝MySQL

>【此處設定的帳密 **必須** 對映後端根目錄( .\api-server\ )準備建立的.env檔(建立此檔案的說明在下面)】

建立drone_cloud_test資料庫

```sql
CREATE DATABASE `drone_cloud_test`; -- 創建資料庫
```

**<font color="Red">下面表格不用建立了！新版的程式碼會自動建立</font>**

若要手動建立user、drones表

```sql
use `drone_cloud_test`; -- 選擇現在所要使用的資料庫 
```

```sql
CREATE TABLE `user`(
`id` BINARY(16) NOT NULL PRIMARY KEY, -- id放 UUID的二進制資料，所以用BINARY(16)格式
`email` VARCHAR(100) NOT NULL ,
`password` VARCHAR(100) NOT NULL
);

CREATE TABLE `drones`(
`id` INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
`user_id` BINARY(16) NOT NULL,-- id放 UUID的二進制資料，所以用BINARY(16)格式
`drone_id` VARCHAR(100) ,
`isAdmin` boolean DEFAULT false, 
FOREIGN KEY(user_id) REFERENCES user(id));
```

![image](./%E6%88%AA%E5%9C%96/024.png)

## 安裝Docker Desktop

[Docker Desktop](https://www.docker.com/products/docker-desktop/)下載安裝檔後直接執行
執行完成會登出重開

## 透過Docker Desktop安裝RabbitMQ

[RabbitMQ安裝教學](https://kucw.github.io/blog/2020/11/rabbitmq/#:~:text=%E7%B6%81%E5%AE%9A%E8%80%8C%E5%B7%B2-,RabbitMQ%20%E5%AE%89%E8%A3%9D%E6%95%99%E5%AD%B8,-%E9%9C%80%E8%A6%81%E5%85%88%E5%AE%89%E8%A3%9D)

安裝完成後，在cmd執行以下指令，來使用 rabbitmq:management 的 docker image

記得先修改 `RABBITMQ_DEFAULT_USER` 和 `RABBITMQ_DEFAULT_PASS` 的參數去自定義帳號密碼，像是此處就是設定帳號為 root、密碼為 1234

> docker run --name rabbitmq -d -p 15672:15672 -p 5672:5672 -e **RABBITMQ_DEFAULT_USER=root** -e **RABBITMQ_DEFAULT_PASS=1234** rabbitmq:management

【需自行更改帳密為先前MySQL設定的 帳號、密碼】

## 執行專案

### 後端(要在<font color="Red">CMD</font>執行，powershell會失敗)

1. 解壓學長的專案

2. 先進入後端( .\api-server\ )，npm install 安裝所需套件
(因為package.json 已經紀錄了專案所使用的套件，所以只要npm install，就能產生node_modules資料夾，裡面就有所有此專案所需的套件)

        cd api-server
        npm install

3. 再此後端根目錄( .\api-server\ )建立`.env檔`，內容就複製同樣此目錄底下的 `.env.example` 裡的內容
3-1. FRONTEND_URL 的 port 改為 5173
(配合前端vue的port)<br>
![image](./%E6%88%AA%E5%9C%96/019.png)

4. 用 `ts-node` 執行專案【全域安裝ts-node：npm install -g ts-node】
(必須在.env檔所在的根目錄執行)

        ts-node src\server.ts

5. 結果<br>
![image](./%E6%88%AA%E5%9C%96/021.png)<br>
此時尚未連線前端，所以還沒有webSocket連線字樣
【但好像如果有開啟前端網頁 http://localhost:5173/ ，不論前端vue是否有執行(即網頁畫面有出現)，後端都會顯示Websocket connected？？？】

**<font color="Red">後端執行成功</font>**

### 前端

另外再開啟一個cmd來執行前端(後端保持執行不必關閉)

1. 進到前端(.\web-ui\ )資料夾，下載所需package

        cd web_ui
        npm install

2. 再此前端根目錄(.\web-ui\ )建立 ~~`.env檔`~~ `.env.local檔`(配合原本學長寫的，上傳github時因為.gitignore的設定不會把此檔案上傳)，內容就複製同樣此目錄底下的 `.env.local.example` 裡的內容
【會影響.\web-ui\src\lib\websocket.js、mapbox.js】
2-1. VITE_APP_BACKEND_SERVICE_SERVICE_PORT 改為 3080
2-2. 到[Mapbox](https://www.mapbox.com/)創建帳號並取得Acess Token，令
VITE_APP_MAPBOX_TOKEN等於它<br>
![image](./%E6%88%AA%E5%9C%96/020.png)

3. 在根目錄執行前端vue專案

        npm run dev

4. 結果<br>
![image](./%E6%88%AA%E5%9C%96/022.png)<br>
開啟前端畫面後(瀏覽器開啟 http://localhost:5173/ )，後端就會通知WebSocket連線成功<br>
![image](./%E6%88%AA%E5%9C%96/023.png)

---

## 嘗試執行過程中遇到問題

### 1. SyntaxError: Cannot use import statement outside a module

> PS C:\Users\AIOTLAB\Downloads\aiwings-main\api-server\src> node server.ts
(node:16364) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
C:\Users\AIOTLAB\Downloads\aiwings-main\api-server\src\server.ts:1
import { config } from 'dotenv';
^^^^^^
>
> SyntaxError: Cannot use import statement outside a module
>
>      at Object.compileFunction (node:vm:360:18)
>      at wrapSafe (node:internal/modules/cjs/loader:1055:15)
>      at Module._compile (node:internal/modules/cjs/loader:1090:27)
>      at Object.Module._extensions..js (node:internal/modules/cjs/loader:1180:10)
>      at Module.load (node:internal/modules/cjs/loader:1004:32)
>      at Function.Module._load (node:internal/modules/cjs/loader:839:12)
>      at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
>      at node:internal/main/run_main_module:17:47
      
後端執行node server.ts的時候，跑出下面的報錯
一開始以為是dotenv的問題後來發現與他無關
最後在 `package.json` 新增 `"type": "module"`才解決
[參考網址](https://www.freecodecamp.org/news/cannot-use-import-statement-outside-a-module-react-typescript-error-solved/)
但是加上這個會出現 **Unknown file extension ".ts" for C:\Users\...\src\server.ts** 的問題QAQ
[Can't run my Node.js Typescript project: Unknown file extension ".ts" for /app/src/App.ts](https://stackoverflow.com/questions/62096269/cant-run-my-node-js-typescript-project-typeerror-err-unknown-file-extension)

再次專案內安裝typescript【大概沒差】
npm install --save-dev typescript

**<font color="Red">解決了！！</font>太白癡了搞錯JS執行方法**
後來看到這篇：[TypeScript: Cannot use import statement outside a module](
https://bobbyhadz.com/blog/typescript-cannot-use-import-statement-outside-module)

說是不能用node去執行專案，而是要用`ts-node`！
【因為ts檔案要**編譯**後轉為js檔後才被Nodejs執行阿】
設定上和原來學長給的一樣，所以把剛剛前面新增的 "type": "module" 移除回復原本的樣子

★**正確執行ts**
法1：用 **`ts-node`** 直接編譯並運行ts檔【**<font color="Red">成功！！！</font>**】
ts-node：可以直接執行TS程式碼，不需要二次轉換

- 安裝`ts-node`
npm install -g ts-node
- 執行程式`ts-node 檔名.ts`

執行時遇到
> RangeError [ERR_SOCKET_BAD_PORT]: options.port should be >= 0 and < 65536. Received NaN.

其實就是`.env`檔找不到，自己創建一個.env檔(因為這個檔案為了資安，是不會git到github上)
.env檔的內容就複製根目錄底下 `.env.example`裡的內容
將.env檔放在根目錄 \api-server\ 資料夾底下，並且在這個位置執行檔案`ts-node src\server.ts`
**<font color="Red">成功！！！</font>**

法1：正常執行ts是先用**tsc**編譯檔案轉出JS檔【**<font color="Red">但不適用在此專案，會失敗尚不清楚原因</font>**】

- 先執行 `tsc 檔名.ts`，得到編譯後的`檔名.js`
- 再執行 `node 檔名.ts`，運行結果

**<font color="Red">然後不知為何用這個方法過後，再用回方法1一樣會跳下面這個錯誤QQ</font>**

    var router = express_1["default"].Router();
                                      ^
    TypeError: Cannot read properties of undefined (reading 'Router')
        at Object.<anonymous> (C:\Users\AIOTLAB\Downloads\aiwings-main\api-server\src\routes\index.js:4:35)
        at Module._compile (node:internal/modules/cjs/loader:1126:14)
        at Module._extensions..js (node:internal/modules/cjs/loader:1180:10)
        at Object.require.extensions.<computed> [as .js] (C:\Users\AIOTLAB\AppData\Roaming\npm\node_modules\ts-node\src\index.ts:1608:43)
        at Module.load (node:internal/modules/cjs/loader:1004:32)
        at Function.Module._load (node:internal/modules/cjs/loader:839:12)
        at Module.require (node:internal/modules/cjs/loader:1028:19)
        at require (node:internal/modules/cjs/helpers:102:18)
        at Object.<anonymous> (C:\Users\AIOTLAB\Downloads\aiwings-main\api-server\src\server.ts:11:1)
        at Module._compile (node:internal/modules/cjs/loader:1126:14)

懶得找了重新解壓學長的重新執行.....

### 2. Client does not support authentication protocol requested by server

因為明明設定MySQL資料庫時的密碼和學長設定的密碼不同，卻還能顯示連接成功覺得很奇怪，所以在連接成功的程式後面新增一段在資料庫中新增一個TABLE的程式碼
(檔案位置：./api-server/src/services/database.ts)
程式參考[這個](https://reurl.cc/n77Vz1)，err、result變數加上:any轉成適合vue-vite的寫法

![image](./%E6%88%AA%E5%9C%96/001.png)

果然執行後雖然顯示連接成功
但後續執行SQL語法時<font color="Red">報錯</font>(那個顯示連接成功是不是不太對還是我哪裡搞錯了?....)
**Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client**
翻成中文：客戶端不支持服務器請求的認證協議； 考慮升級 MySQL 客戶端
![image](./%E6%88%AA%E5%9C%96/002.png)

查到：[這篇](https://blog.csdn.net/lovedingd/article/details/106728292)和[這篇](https://blog.csdn.net/weixin_42211816/article/details/128143048?spm=1001.2101.3001.6650.1&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-128143048-blog-106728292.pc_relevant_3mothn_strategy_recovery&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7ERate-1-128143048-blog-106728292.pc_relevant_3mothn_strategy_recovery&utm_relevant_index=2)很有幫助

        网上说出现这种情况的原因是：mysql8 之前的版本中加密规则是mysql_native_password,而在mysql8之后,加密规则是caching_sha2_password, 

        解决问题方法有两种：

        方法1.升级navicat驱动；

        方法2.把mysql用户登录密码加密规则还原成mysql_native_password. 
        ————————————————
        版权声明：本文为CSDN博主「慕城南风」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
        原文链接：https://blog.csdn.net/lovedingd/article/details/106728292

--

        错误原因：目前的数据库连接使用的node-mysql模块不符合新版的规则，所以会报出这个错误，那我们只需要修改旧的模块便可以解决问题了。

解決方法：

**CMD方式解決**

1. 透過CMD登入MySQL【注意如果MySQL沒有加到環境變數會無法使用下面指令，除非直接進入MySQL server的bin資料夾中方可執行】

        mysql -uroot -p
        # 接著會要求輸入密碼

2. 然後查詢用户信息，如發現plugin `非mysql_native_password` 則需要修改密碼

```sql
select host,user,plugin,authentication_string from mysql.user;
```

3. 修改plugin格式&密碼

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
# 更新 「user为root，host为localhost」的密码以 mysql_native_password 改为 123456
```

**MySQL workbench直接用**【<font color="Red">我用這個方法</font>】

流程同上，只是workbench介面更加清楚

1. 用MySQL workbench登入使用者root帳號

2. 然後查詢用户信息，如發現plugin `非mysql_native_password` 則需要修改密碼

```sql
select host,user,plugin,authentication_string from mysql.user;
```

3. 修改plugin格式&密碼

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
# 更新 「user为root，host为localhost」的密码以 mysql_native_password 改为 password
```

檢查(再次執行 2. 的指令)，可以看到root的plugin變成`mysql_native_password`
![image](./%E6%88%AA%E5%9C%96/004.png)

之後再回去執行後端server，測試的TABLE被成功加進去資料庫中了

## 3. Socket的URL總顯示undefind

![image](./%E6%88%AA%E5%9C%96/005.png)

解決：
起初懷疑是api-server後端資料夾中的socket.io連線的問題，但找不到為何顯示undedfind
後來發現原來是Web-ui資料夾底下`.src/lib/websocket.js`的問題，因為找不到**VITE_APP_BACKEND_SERVICE_PROTOCOL**這個參數資料，才發現原來Web-ui資料夾也要新增`.env` 檔案

![image](./%E6%88%AA%E5%9C%96/006.png)

雖然還是不行用但至少url的部分正常了

![image](./%E6%88%AA%E5%9C%96/007.png)

### 4. 繼續解決連線問題 ERR_CONNECTION_REFUSED

解決：
基本上查到都說是連線問題
感覺請求後端的這個port好像怪怪的，所以改成和後端.env檔案(./api-server/.env)中相同的port：3080
![image](./%E6%88%AA%E5%9C%96/013.png)
<img src="./%E6%88%AA%E5%9C%96/011.png" width="380"/><img src="./%E6%88%AA%E5%9C%96/012.png" width="280"/>
<!-- ![image](./%E6%88%AA%E5%9C%96/011.png)![image](./%E6%88%AA%E5%9C%96/012.png) -->
結果：
(原本以為這個結果不對後來發現好像是正確方向)

> Access to XMLHttpRequest at 'http://localhost:3080/socket.io/?EIO=4&transport=polling&t=ORTMFap' from origin 'http://localhost:5173' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:8080' that is not equal to the supplied origin.

> GET http://localhost:3080/socket.io/?EIO=4&transport=polling&t=ORTMFap net::ERR_FAILED 200 (OK)

![image](./%E6%88%AA%E5%9C%96/014.png)

### 5. CORS問題 (has been blocked by CORS policy)

CROS policy問題基本上是不同源的問題
一開始搞錯，一直改8080、3080，然後都解決不了
後來發現，原來在問題4的時候，改成 port 3080 後，其實請求有成功！只是被cros policy擋下

> Status Code: 200 OK  【代表請求成功】

問題是出在cros policy

> Referrer Policy: strict-origin-when-cross-origin 【請求不同源被擋下】

![image](./%E6%88%AA%E5%9C%96/008.png)

解決：

反正經過一番研究後，最後發現其實應該改的是後端的.env檔中(./api-server/.env)的前端port為5173
**把後端的.env檔中的FRONTEND_URL的port改為5173**
![image](./%E6%88%AA%E5%9C%96/015.png)

然後**重啟server**
WebSocket連線成功了！！
![image](./%E6%88%AA%E5%9C%96/016.png)
![image](./%E6%88%AA%E5%9C%96/017.png)

但仍有問題

### 6.

![image](./%E6%88%AA%E5%9C%96/018.png)


> SET SQL_SAFE_UPDATES = 0;        -- 關掉預設的更新模式


        Access to XMLHttpRequest at 'http://localhost:3080/socket.io/?EIO=4&transport=polling&t=ORTILnU' 
        from origin 'http://localhost:5173' has been blocked by CORS policy: 
        The 'Access-Control-Allow-Origin' header has a value 'http://localhost:8080' that is not equal to the supplied origin.
> strict-origin-when-cross-origin
