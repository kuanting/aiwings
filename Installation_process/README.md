###### tags: `aiwings`

[Toc]

# The installation process.

## 1. Install MySQL and create database

1. **`Install MySQL Community`** 

    <font color="Red">Note</font>: The `user` and `password` configured must match the environment variable configuration file.
    <img src="https://hackmd.io/_uploads/B1cIL7Ovh.png" width="50%"/>

    The location of the environment variable configuration file: `aiwings\api-server\.env`

    The instructions for creating the `.env` file are at the back

2. Open MySQL Workbench
3. Input following command to creat
4. Enter the following command to create the database
   <font color="Red">Note</font>: The created database name should correspond to `aiwings\api-server\src\services\database.ts`.
    ```sql
    CREATE DATABASE `drone_cloud_test`; -- create a database named `drone_cloud_test`
    ```
    ![](https://hackmd.io/_uploads/ryNu1EuD3.png)




## 2. Install Docker Desktop

[Docker Desktop](https://www.docker.com/products/docker-desktop/)
Run directly after downloading the installation file.
After the execution is complete, it will log out and reopen.

## 3. Install RabbitMQ through Docker

After installing Docker Desktop

Start using the docker image "rabbitmq:management" to set up RabbitMQ.

**`Open CMD and input the following command`**
   > <font color="blue">EX: Create a RabbitMQ with user as `root` and password as `1234`</font>
   > docker run --name rabbitmq -d -p 15672:15672 -p 5672:5672 -e RABBITMQ_DEFAULT_USER=`root` -e RABBITMQ_DEFAULT_PASS=`1234` rabbitmq:management
   
   You can customize the USER and PASSWORD. 
   <font color="Red">Note</font>: Remember to change the `USER` and `PASSWORD` to match the environment variable configuration file.
   
   The location of the environment variable configuration file: `aiwings\api-server\.env`
   The instructions for creating the `.env` file are at the back
   
## 4. Execute the project

You need to execute it in `CMD`. It may fail in PowerShell.

### Backend

1. Unzip the project

2. Enter the backend folder (.\api-server\). 
   Run "npm install" to install the required packages and generate the "node_modules" folder.
    ```
    cd api-server
    npm install
    ```
    ![](https://hackmd.io/_uploads/rJ_6wVOwh.png)

3. Create `.env`file in the backend root directory ( .\api-server\ ).
   Copy the contents of `.env.example` under the same directory.

    - Change the port of FRONTEND_URL to 5173
      (Cooperate with the front-end vue port)
      ![](https://hackmd.io/_uploads/H1gcfNdP2.png)
      ps. Here you can set the account secrets of MySQL and RabbitMQ. If they are inconsistent with the real situation, you will not be able to connect
      
4. Executing projects with `ts-node`
   【Note: The "server.ts" file is a TypeScript file and cannot be executed directly using node】
   `ts-node`：It allows you to directly compile and run TypeScript files without the need for a secondary conversion.


    - If you don't have ts-node，global install ts-node
        ```
        npm install -g ts-node
        ```
    - Executing projects with `ts-node`
      (Must be executed in the root directory where the `.env` file is located)
      ![](https://hackmd.io/_uploads/ByVsc-wvh.png)
      ```
      ts-node src\server.ts
      ```

5. Result
   ![](https://hackmd.io/_uploads/Hyph5-Pw3.png)
(Need to open rabbitMQ, otherwise there will be an error of connection failure)

At this moment, there is no WebSocket connection message because the frontend is not yet connected.

However, if you have opened the frontend webpage at `http://localhost:5173/`, the backend will display "`WebSocket connected`" once the WebSocket connection is established.

**<font color="Red">The backend executed successfully.</font>**

---

### Frontend

Open  a new cmd to execute the frontend (the backend keep executing)

1. 進到前端(.\web-ui\ )資料夾，下載所需package
    ```
    cd web_ui
    npm install
    ```
    ![](https://hackmd.io/_uploads/BJBOd4ODn.png)





2. Create `.env`file in the frontend root directory ( .\web-ui\ ).
   Copy the contents of `.env.local.example` under the same directory.
   
    1. Chang the port of VITE_APP_BACKEND_SERVICE_SERVICE_PORT to 3080
    2. Go to [Mapbox](https://www.mapbox.com/) to create an account and get an Access Token. 
       Set the value of VITE_APP_MAPBOX_TOKEN to the Access Token obtained from Mapbox.
       ![](https://hackmd.io/_uploads/B1mx3WwP3.png)
       [will affect .\web-ui\src\lib\websocket.js, mapbox.js]
       
3. To run the frontend Vue project in the frontend root directory.
    ```
    npm run dev
    ```
4. 結果
![](https://hackmd.io/_uploads/rJ1M0ZwPn.png)

**<font color="Red">The frontend executed successfully.</font>**

After opening the frontend interface (by opening http://localhost:5173/ on browser), the backend will display WebSocket connection successful.

![](https://hackmd.io/_uploads/HJYKhWPv3.png)

---

# Other possible error solutions

## Confirm whether the environment variable configuration file is created

EX: Encountered this error when executing
> RangeError [ERR_SOCKET_BAD_PORT]: options.port should be >= 0 and < 65536. Received NaN.

Because it can't find the `.env` file, remember to create a `.env` file by yourself. (Because this file will not be git to github for information security)

## ERROR：Client does not support authentication protocol requested by server

At present, "Connect to database successfully" displayed on the backend seems to have a problem.

It is possible that the connection was not successful.

Add code here to test if the connection is successful. (These highlighted programs represent adding a TABLE to the database.)
(file location：./api-server/src/services/database.ts)
![](https://hackmd.io/_uploads/HygflGDD3.png)
Program reference [this](https://reurl.cc/n77Vz1), err, result variable plus `: any` to convert to a suitable vue-vite wording


Jump out of this error after execution：
> **Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client**
![](https://hackmd.io/_uploads/H137xfvv2.png)

Possible reason:
> In versions before mysql8, the encryption rule is `mysql_native_password`, but after mysql8, the encryption rule is `caching_sha2_password`.
> 
> Solution:
> 1. Upgrade the navicat driver
> 2. Restore the mysql user login password encryption rules to mysql_native_password.
> 
> ————————————————
> original source: https://blog.csdn.net/lovedingd/article/details/106728292

One of the solutions:

1. Open MySQL Workbench and login
2. Querying user information.
   
   If the plugin is found to be "non-mysql_native_password", it is necessary to modify the password.
   
   Execute this command to query user information.

    ```sql
    select host,user,plugin,authentication_string from mysql.user;
    ```
    ![](https://hackmd.io/_uploads/B1mSxGwwn.png)
【PS. I forgot to take a screenshot first, the last line was not mysql_native_password, it changed to mysql_native_password after modification】

3. Modify the plugin format and password.

    Update the password for the `user "root" with the host "localhost"` to be `"password"`. The password format for this password should be `"mysql_native_password"`.

    ```sql
    ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
    ```
    Note: The password is set to "password" to match the configuration in the backend `.env` file.
    
4.  Check (execute the instructions in 2. again), you can see that the root plugin becomes `mysql_native_password`
      ![](https://hackmd.io/_uploads/B1mSxGwwn.png)

5. Then go back and execute the backend server, the tested TABLE should be successfully added to the database