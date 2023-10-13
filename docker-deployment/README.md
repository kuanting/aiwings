# Deploying with Docker

## Install backend and frontend all at once.

If you wish to deploy the frontend and backend separately, please refer to `aiwings/api-server/docker_backend-deployment/` for backend deployment and `aiwings/web_ui/docker_front-deployment/` for frontend deployment.

## Applicable scenario

- Want to have **the frontend application and the backend application on the same computer**.
- Regardless of whether RabbitMQ and MySQL are already installed, you can follow the instructions below for the operation.

## Pre-installation preparations

- Install [Docker](https://www.docker.com/get-started/) on your computer.

- If you haven't and wish to install RabbitMQ or MySQL on the same computer as the backend application:

  - If you haven't installed RabbitMQ yet, please make sure that the ports `15672` and `5672` are not in use if possible.
  - If you haven't installed MySQL yet, please make sure that the ports `3306` are not in use if possible.

## Document explanation

Unzipping the `.zip` file will give you the default `.env` file.

![image](https://i.imgur.com/b5wCLAF.png)

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

      Note: If you want using docker-compose.yml to install MySQL, the username for MySQL don't set as 'root'. 

- Default usernames and passwords: 
  - RabbitMQ: guest/guest
  - MySQL: user/mysql

**If you already install RabbitMQ:**
- Change the value of `RABBITMQ_SERVICE_SERVICE_HOST` to your RabbitMQ server IP. 
- If your RabbitMQ server backend not using default port '5672', Change the value of `RABBITMQ_SERVICE_SERVICE_PORT` to your RabbitMQ server port. 

**If you already install MySQL:**
- Change the value of `MYSQL_SERVICE_SERVICE_HOST` to your MySQL server IP. 
- If your MySQL server not using default port '3306', Change the value of `MYSQL_SERVICE_SERVICE_PORT` to your MySQL server port. 
- Because not using the provided docker-compose.yml to create MySQL, you can use 'root' user to connect your MySQL.

### `docker-compose.yml` file

You can change `URL_FRONTEND` to your IP or domain.
- Default frontend address: **URL_FRONTEND=localhost**

You can change SSL certificate.
- If you are using a domain name and need to bind your domain's SSL certificate, you can do so using the following method.
- Remove the comments from the following lines, and replace './ssl/' with the path to your SSL certificate folder."
  ```yml
  volumes:
  - ./ssl/:/etc/nginx/ssl/
  ```
  - Note: Your SSL certificate folder must include two separate files named `certificate.crt` and `private.key`.

**If you haven't installed RabbitMQ or MySQL yet:**
- Don't change anything.
- You only can change your MySQL 'root' user's password if you want.
  - Default 'root' password: **MYSQL_ROOT_PASSWORD=password**

**If you already install MySQL:**
- Comment out or delete the entire mysql_service in docker-compose.yml.
- And change the MySQL connection parameters in the .env file.

**If you already install RabbitMQ:**
- Comment out or delete the entire rabbitmq_service in docker-compose.yml.
- And change the MySQL connection parameters in the .env file.

### How to install

1. Open Command Prompt

2. cd to `docker-deployment/` folder

3. Run docker-compose.yml in the background with the following command. Then you can see four container in your docker desktop.

    ```
    docker-compose up -d
    ```

    ![image](https://i.imgur.com/C5yHjod.png)

    ![image](https://i.imgur.com/w3DohxC.png)

4. Restart back-end container.

    ![image](https://i.imgur.com/4WTBVM9.png)

5. To access the web application, simply navigate to `http://<localhost, your IP, or your domain>` in your web browser.