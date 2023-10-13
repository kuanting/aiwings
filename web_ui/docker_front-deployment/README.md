# Deploying with Docker

## Install frontend application. ((Backend deployment on another computer.))

Here we will install the frontend application and explain how to connect to the backend application on a specified IP address.

After the frontend is successfully set up, if the backend has not been deployed yet, please refer to `aiwings/api-server/docker_backend-deployment/` for instructions on how to deploy the backend.

If you wish to install the backend application and the frontend application on the same computer, you can refer to `aiwings/docker-deployment/` for instructions.

If you wish to deploy the frontend and backend separately, please refer to `aiwings/api-server/docker_backend-deployment/` for backend deployment and `aiwings/web_ui/docker_front-deployment/` for frontend deployment.

## Applicable scenario

- Want to have **the frontend application and the backend application on the same computer**.
- For backend application installation, please refer to `aiwings/api-server/docker_backend-deployment/`.

## Pre-installation preparations

- Install [Docker](https://www.docker.com/get-started/) on your computer.

## Document explanation

### `docker-compose.yml` file

You can change `URL_FRONTEND` to your IP or domain.
- Default frontend address: **URL_FRONTEND=localhost**

You must to change `URL_BACKEND` to your backend IP or domain.
- Default backend address: **URL_BACKEND=backend_IP**

      Note: If you forget to set the value of 'URL_BACKEND' to your backend IP or domain, after creating the frontend application, it will not be able to connect to the backend.

      Note: Make sure your frontend computer can ping to your backend address.

You can change SSL certificate.
- If you are using a domain name and need to bind your domain's SSL certificate, you can do so using the following method.
- Remove the comments from the following lines, and replace './ssl/' with the path to your SSL certificate folder."
  ```yml
  volumes:
  - ./ssl/:/etc/nginx/ssl/
  ```
  - Note: Your SSL certificate folder must include two separate files named `certificate.crt` and `private.key`.

### How to install

1. Open Command Prompt

2. cd to `docker-deployment/` folder

3. Installation Method 1: using docker-compose.yml

    Run docker-compose.yml in the background with the following command. Then you can see four container in your docker desktop.

      ```
      docker-compose up -d
      ```

      ![image](https://i.imgur.com/2JJgsnM.png)

      ![image](https://i.imgur.com/vfSdFoI.png)

4. Installation Method 1: Using docker command

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

5. To access the web application, simply navigate to `http://<localhost, your frontend IP, or your frontend domain>` in your web browser.

6. If you haven't install backend, please refer to `aiwings/api-server/docker_backend-deployment/` for instructions on how to deploy the backend.

### Confirm whether the frontend and backend are successfully connected.

Open `http://<localhost, your frontend IP, or your frontend domain>/api/v1` in your web browser and confirm if you can see the text '**{"server":"Running"}**'.

- If you can see it, it means the frontend and backend are successfully connected.

- If you can't:

  - Open `http://<your backend IP, or your backend domain>:3080/api/v1` in your web browser and confirm if you can see the text '**{"server":"Running"}**'.
    - If you can't, it may means your computer can't connect to this IP. 

    - Make sure your frontend computer can ping to your backend address.