# Deploying Backend with Docker

## Install MySQL, RabbitMQ, and backend application. (Frontend deployment on another computer.)

Whether MySQL, RabbitMQ, and the backend application are installed on the same computer or not, here we will link them together to create a complete backend.

After the backend is successfully set up, if the frontend has not been deployed yet, please refer to `aiwings/web_ui/docker_front-deployment/` for instructions on how to deploy the frontend.

If you wish to install the backend application and the frontend application on the same computer, you can refer to `aiwings/docker-deployment/` for instructions.

## Applicable scenario

- Wish to deploy **the frontend application and backend application separately on different computers**.
- Regardless of whether RabbitMQ and MySQL are already installed, you can follow the instructions below for the operation.
- For frontend application installation, please refer to `aiwings/web_ui/docker_front-deployment/`.

## Pre-installation preparations

- Install [Docker](https://www.docker.com/get-started/) on your computer.

- If you haven't and wish to install RabbitMQ or MySQL on the same computer as the backend application:

  - If you haven't installed RabbitMQ yet, please make sure that the ports `15672` and `5672` are not in use if possible.
  - If you haven't installed MySQL yet, please make sure that the ports `3306` are not in use if possible.

## Document explanation

Unzipping the `.zip` file will give you the default `.env` file.

![image](https://i.imgur.com/m6MOZQe.png)

### `.env` file

`RabbitMQ and MySQL connection parameters.`

```python
# rabbitmq_service and mysql_service are service names created in the docker-compose.yml file.

# RabbitMQ connection parameters
RABBITMQ_SERVICE_SERVICE_HOST=rabbitmq_service
RABBITMQ_SERVICE_SERVICE_PORT=5672
RABBITMQ_SERVICE_USER=guest
RABBITMQ_SERVICE_PASSWORD=guest

# MySQL connection parameters
MYSQL_SERVICE_SERVICE_HOST=mysql_service
MYSQL_SERVICE_SERVICE_PORT=3306
MYSQL_SERVICE_USER=user
MYSQL_SERVICE_PASSWORD=mysql
```

**If you haven't installed RabbitMQ or MySQL yet:** 
- You can set the usernames and passwords for your new MySQL and RabbitMQ here.

      Note: If you want using docker-compose.yml to install MySQL, the value of MYSQL_SERVICE_USER don't set as 'root'. 

- Default usernames and passwords: 
  - RabbitMQ: guest/guest
  - MySQL: user/mysql

**If you already install RabbitMQ:**
- Change the value of `RABBITMQ_SERVICE_SERVICE_HOST` to your RabbitMQ server IP. (The IP don't use 127.0.0.1 or localhost)
- If your RabbitMQ server backend not using default port '5672', Change the value of `RABBITMQ_SERVICE_SERVICE_PORT` to your RabbitMQ server port. 

**If you already install MySQL:**
- Change the value of `MYSQL_SERVICE_SERVICE_HOST` to your MySQL server IP. (The IP don't use 127.0.0.1 or localhost)
- If your MySQL server not using default port '3306', Change the value of `MYSQL_SERVICE_SERVICE_PORT` to your MySQL server port. 
- Because not using the provided docker-compose.yml to create MySQL, you can use 'root' user to connect your MySQL.

### `docker-compose.yml` file

**If you haven't installed RabbitMQ or MySQL yet:**
- It can be used directly without changing anything.
- You can change your MySQL 'root' user's password if you want.
  - Default 'root' password: **MYSQL_ROOT_PASSWORD=password**

**If you already install MySQL:**
- Comment out or delete the entire mysql_service in docker-compose.yml.【line 41~56】
- Comment out or delete the **mysql_service option** in the depends_on of the backend.【Line 66】
- And change the MySQL connection parameters in the .env file.

**If you already install RabbitMQ:**
- Comment out or delete the entire rabbitmq_service in docker-compose.yml.【line 28~39】
- Comment out or delete the **rabbitmq_service option** in the depends_on of the backend.【Line 65】
- And change the MySQL connection parameters in the .env file.

## How to install

1. Open Command Prompt

2. cd to `docker_backend-deployment/` folder

3. Run docker-compose.yml in the background with the following command. Then you can see three container in your docker desktop.

    ```
    docker-compose up -d
    ```

    ![image](https://i.imgur.com/5sqLudd.png)

    ![image](https://i.imgur.com/EIO8YXy.png)

4. If you haven't install frontend, please refer to `aiwings/web_ui/docker_front-deployment/` for instructions on how to deploy the frontend.