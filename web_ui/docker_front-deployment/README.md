# Deploying frontend with Docker

## Install frontend application. (Backend deployment on another computer.)

Here we will install the frontend application and explain how to connect to the backend application on a specified IP address.

If you have successfully set up the frontend but the backend has not been deployed yet, please refer to the instructions in `aiwings/api-server/docker_backend-deployment/` for deploying the backend.

If you wish to install the backend application and the frontend application on the same computer, you can refer to `aiwings/docker-deployment/` for instructions.

## Applicable scenario for this document

- Want to have **the frontend application and the backend application on different computers separately**.
- This document will provide relevant instructions for frontend deployment.
- For backend application installation, please refer to `aiwings/api-server/docker_backend-deployment/`.

## Pre-installation preparations

- Install [Docker](https://www.docker.com/get-started/) on your computer.

## Document explanation

Before embarking on the Docker containerized deployment of the aiwings frontend application, you need to configure two crucial files according to your requirements: the `.env.frontend.local file` and the `docker-compose.yml file`. These two files play vital roles throughout the entire deployment process.

### `.env.frontend.local` file

- Rename the `.env.frontend.local.example` file to `.env.frontend.local`.

- The .env.frontend.local file contains environment variable settings for configuring the aiwings frontend application. By modifying these parameter values, users can customize `the IP settings for the frontend webpage as well as the actual IP for the backend`.

```python
# """
# Parameters used to build the Docker image for the frontend (2023aiotlab/web_ui).
# """
URL_FRONTEND=localhost
URL_BACKEND=localhost
```

- You can set the `URL_FRONTEND` value to your IP or domain to configure the web address for the aiwings frontend application.

  - Default frontend address: localhost

- You must change the `URL_BACKEND` to the actual IP or domain of your backend (Don't use 127.0.0.1 or localhost unless you are running the aiwings backend program locally without Docker).

  - Default backend address: localhost

        Note: If you forget to set the value of 'URL_BACKEND' to your backend IP or domain, after creating the frontend application, it will not be able to connect to the backend.

        Note: Make sure your frontend computer can ping to your backend address.
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

## How to install

### **Installation Method 1: using docker-compose.yml**

1. Open Command Prompt

2. cd to `web_ui/docker_front-deployment/` folder

3. Run docker-compose.yml in the background with the following command. Then you can see the frontend container in your docker desktop.

      ```
      docker-compose up -d
      ```

      ![image](https://i.imgur.com/2JJgsnM.png)

      ![image](https://i.imgur.com/vfSdFoI.png)

4. To access the web application, simply navigate to `http://<the value of URL_FRONTEND>` in your web browser.

5. If you haven't install backend, please refer to `aiwings/api-server/docker_backend-deployment/` for instructions on how to deploy the backend.


### **Installation Method 2: Using docker command**

1. Open Command Prompt

2. Run the following command. Then you can see the frontend container in your docker desktop.

      ```
      docker run --name front_end \
                 --restart always \
                 -p 80:80 \
                 -p 443:443 \
                 -e URL_FRONTEND=<localhost, your frontend IP, or your frontend domain> \
                 -e URL_BACKEND=<your backend IP, or your backend domain> \
                 -v <your SSL folder>:/etc/nginx/ssl/ \
                 -d 2023aiotlab/web_ui:1.0
      ```
3. If you haven't install backend, please refer to `aiwings/api-server/docker_backend-deployment/` for instructions on how to deploy the backend.

## Confirm whether the frontend and backend are successfully connected.

If you already deploy the backend: 

Open `http://<the value of URL_FRONTEND>/api/v1` in your web browser and confirm if you can see the text '**{"server":"Running"}**'.

- If you can see it, it means the frontend and backend are successfully connected.

- If you can't:

  - Open `http://<the value of URL_FRONTEND>:3080/api/v1` in your web browser and confirm if you can see the text '**{"server":"Running"}**'.
    - If you can't, it may means your computer can't connect to this IP. 

    - Make sure your frontend computer can ping to your backend address.