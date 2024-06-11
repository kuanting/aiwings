# Deploying with Docker

## Install backend and frontend all at once.

If you wish to deploy the frontend and backend separately on different computers, please refer to `aiwings/api-server/docker_backend-deployment/` for backend deployment and `aiwings/web_ui/docker_front-deployment/` for frontend deployment.

## Applicable scenario for this document

- Want to **install the frontend and backend applications of aiwings on the same computer**.
- This document will provide comprehensive instructions for the one-time deployment of both the frontend and backend of aiwings, including the installation of RabbitMQ and MySQL required for the backend.
- Regardless of whether RabbitMQ and MySQL are already installed, you can follow the instructions below for the operation.

## Pre-installation preparations

- Install [Docker](https://www.docker.com/get-started/) on your computer.

- If you haven't and wish to install RabbitMQ or MySQL on the same computer as the backend application:

  - If RabbitMQ is not yet installed, please ensure that ports `15672` and `5672` are not occupied by other applications, as the RabbitMQ container will use these ports as the default ports.

  - If MySQL is not yet installed, please ensure that port `3306` is not occupied by other applications, as the MySQL container will use port 3306 as the default port.

## Document explanation

Before embarking on the Docker containerized deployment of the aiwings application, you need to configure two crucial files according to your requirements: the `.env file` and the `docker-compose.yml file.` These two files play vital roles throughout the entire deployment process.

### `.env` file

- Rename the `.env.example` file to `.env`.

- The .env file contains environment variable settings used to configure the aiwings application. By modifying these parameter values, users can customize the backend's connection settings with RabbitMQ and MySQL, as well as configure the IP settings for the frontend.

```python
# .env default file

# """
# Parameters used to build the Docker image for the backend (2023aiotlab/api_server).
# """

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

MYSQL_ROOT_PASSWORD=password

# """
# Parameters used to build the Docker image for the frontend (2023aiotlab/web_ui).
# """
URL_FRONTEND=localhost
# URL_BACKEND=backend
```

#### If not Yet Installed RabbitMQ or MySQL:
- If RabbitMQ or MySQL is not yet installed, you can set the usernames and passwords for the newly created MySQL and RabbitMQ here.

- Default usernames and passwords: 
  - RabbitMQ: guest/guest
  - MySQL: user/mysql
  - MYSQL_ROOT: root/password 

#### If you already install RabbitMQ:
- Change the value of `RABBITMQ_SERVICE_SERVICE_HOST` to your RabbitMQ server IP. (The IP don't use 127.0.0.1 or localhost)
- If the backend of your created RabbitMQ server not using default port '5672', Change the value of `RABBITMQ_SERVICE_SERVICE_PORT` to your RabbitMQ backend server port. 
- In the docker-compose.yml file, comment out the relevant settings.

#### If you already install MySQL:
- Change the value of `MYSQL_SERVICE_SERVICE_HOST` to your MySQL server IP. (The IP don't use 127.0.0.1 or localhost)
- If your created MySQL server not using default port '3306', Change the value of `MYSQL_SERVICE_SERVICE_PORT` to your MySQL server port. 
- Because not using the provided docker-compose.yml to create MySQL, you can also change `MYSQL_SERVICE_USER` and `MYSQL_SERVICE_PASSWORD` to 'root' user and its password to connect your MySQL.
- In the docker-compose.yml file, comment out the relevant settings.

#### Customize the Web IP

- You can change `URL_FRONTEND` to your IP or domain.

- Default frontend Web IP: localhost

### `docker-compose.yml` file

- The docker-compose.yml file defines the containerized deployment configuration for the aiwings application. Through this file, you can quickly accomplish the deployment of aiwings.

#### change SSL certificate

You can change SSL certificate.

- If you are using a domain name and need to bind your domain's SSL certificate, you can do so using the following method.

- Remove the comments from the following lines, and replace './ssl/' with the path to your SSL certificate folder."

  ```yml
  volumes:
  - ./ssl/:/etc/nginx/ssl/
  ```
  - Note: Your SSL certificate folder must include two separate files named `certificate.crt` and `private.key`.

#### If not Yet Installed RabbitMQ or MySQL:
- It can be used directly without changing anything. 

#### If you already install MySQL:
- Comment out or delete the entire mysql_service in docker-compose.yml.【line 41~56】
- Comment out or delete the **mysql_service option** in the depends_on of the backend.【Line 66】
- And change the MySQL connection parameters in the .env file.

#### If you already install RabbitMQ:
- Comment out or delete the entire rabbitmq_service in docker-compose.yml.【line 28~39】
- Comment out or delete the **rabbitmq_service option** in the depends_on of the backend.【Line 65】
- And change the MySQL connection parameters in the .env file.

## How to install

1. Open Command Prompt

2. cd to `docker-deployment/` folder

3. Run docker-compose.yml in the background with the following command. Then you can see four container in your docker desktop.

    ```
    docker-compose up -d
    ```

    ![image](https://i.imgur.com/C5yHjod.png)

    ![image](https://i.imgur.com/w3DohxC.png)

4. To access the web application, simply navigate to `http://<localhost, your IP, or your domain>` in your web browser.