# Deploying Backend with Docker

## Install MySQL, RabbitMQ, and backend application. (Frontend deployment on another computer.)

Whether MySQL, RabbitMQ, and the backend application are installed on the same computer or not, here we will link them together to create a complete backend.

If you have successfully set up the backend but the frontend has not been deployed yet, please refer to the instructions in `aiwings/web_ui/docker_front-deployment/` for deploying the frontend.

If you wish to install the backend application and the frontend application on the same computer, you can refer to `aiwings/docker-deployment/` for instructions.

## Applicable scenario for this document

- Want to have **the frontend application and the backend application on different computers separately**.
- This document will provide relevant instructions for backend deployment, including the installation of RabbitMQ and MySQL required for the backend.
- Regardless of whether RabbitMQ and MySQL are already installed, you can follow the instructions below for the operation.
- For frontend application installation, please refer to `aiwings/web_ui/docker_front-deployment/`.

## Pre-installation preparations

- Install [Docker](https://www.docker.com/get-started/) on your computer.

- If you haven't and wish to install RabbitMQ or MySQL on the same computer as the backend application:

  - If RabbitMQ is not yet installed, please ensure that ports `15672` and `5672` are not occupied by other applications, as the RabbitMQ container will use these ports as the default ports.

  - If MySQL is not yet installed, please ensure that port `3306` is not occupied by other applications, as the MySQL container will use port 3306 as the default port.

## Document explanation

Before embarking on the Docker containerized deployment of the aiwings application, you need to configure two crucial files according to your requirements: the `.env file` and the `docker-compose.yml file.` These two files play vital roles throughout the entire deployment process.

### `.env` file

- Rename the `.env.example` file to `.env`.

- The .env file contains environment variable settings used to configure the aiwings backend application. By modifying these parameter values, users can customize `the backend's connection settings with RabbitMQ and MySQL`.

```python
# .env backend default file

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

### `docker-compose.yml` file

- The docker-compose.yml file defines the containerized deployment configuration for the aiwings application. Through this file, you can quickly accomplish the deployment of aiwings.

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

### **Installation Method 1: using docker-compose.yml**

1. Open Command Prompt

2. cd to `api-server/docker_backend-deployment/` folder

3. Run docker-compose.yml in the background with the following command. Then you can see these containers in your docker desktop.

    ```
    docker-compose up -d
    ```

    ![image](https://i.imgur.com/5sqLudd.png)

    ![image](https://i.imgur.com/EIO8YXy.png)

4. If you haven't install frontend, please refer to `aiwings/web_ui/docker_front-deployment/` for instructions on how to deploy the frontend.