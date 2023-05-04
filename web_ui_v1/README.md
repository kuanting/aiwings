# Drone Cloud Platform | Drone As A Service | DaaS 

![Github Action](https://github.com/waiting33118/drone-cloud-platform3.0/actions/workflows/deployment.yml/badge.svg)
![Vue](https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D)

![banner](./public/img/github_readme_banner.png)

> [Drone Cloud Platfrom](https://aiotlab-drone-cloud.web.app/) is a drone ground control system (GCS) build by Vue.js and it provide user to control there ardupilot-based drone through 4G network.

## Service Introduction
![Concept](./public/img/eco-system%20relationship.png)

> We propose an eco-system of the UAV, the system including frontend service, backend API server, multi drone simulation environment, topic-subscribe broker. The pilot commanding the drone by controlling the fronend interface, the command will first forward to the backend by using Websocket, then the AMQP client in the backend server will send the command to the AMQP broker, after recieved the payload, it would follow the routing rules and forward the command to the target drone.

> **Views/Components Design**
![Component Design](./public/img/component%20tree.png)

> **Global State Management (Vuex)**
![Vuex](./public/img/global%20state%20usage.png)

### Experiment Captures

> **Main control interface**
![Main_Page](./public/img/service%20introduction.png)

> **Drone that flight by platform service**
![real_world_test](./public/img/flight_1.png)

> **SITL infrastructure to simulate multi-drones**
![sitl](./public/img/multi-drone%20simulation.png)

> **Multi drones observation**
![multi-drone_observation](./public/img/multi-drone%20verification%20by%20sitl.png)

> **Drone's orbit history records**
![records](./public/img/flight%20records.png)

> **Object detection (Tensorflow.js)**
![object detection](./public/img/object%20detection.png)

## Project Setup

### 1. Prerequisite

1. Node.js LTS runtime  (Install by NVM or official Website)
1. Backend API server (Please setup [drone-api-server](https://github.com/waiting33118/drone-api-server) first!!)

### 2. Install Dependencies

```bash
npm install
```

### 3. Config Environment Variables

Copy env example file and rename to `.env.local`

```bash
cp .env.local.example .env.local
```

Fill in credentials

```bash
VUE_APP_MAPBOX_TOKEN=your mapbox token
VUE_APP_BACKEND_SERVICE_PROTOCOL=http
VUE_APP_BACKEND_SERVICE_SERVICE_HOST=localhost
VUE_APP_BACKEND_SERVICE_SERVICE_PORT=3030
```

_Generate mapbox token(free, no need credit card) in [mapbox offical website](https://account.mapbox.com/access-tokens/create)_

### 4. Run project (Development mode)

```bash
npm run serve
```

_Frontend service will now run on http://localhost:8080_

### 5. Build project (Production mode)

```bash
npm run build
```

### 6. Deployment

Initial firebase configs

```bash
firebase init
```

Deploy to firebase hosting

```bash
firebase deploy --only hosting
```

## How to start to use the drone service?

### 1. Download the App

[Download the latest apk](https://github.com/waiting33118/AED-Rescue-Drone-Project-for-Android/releases)

### 2. Open the App to get the **Drone ID**

<img src="./public/img/drone_id_step.jpg" height="500">

### 3. Sign up the service account

- [Drone Cloud Platform Sign up](https://aiotlab-drone-cloud.web.app/signup)
- Enter your Drone ID that shows on your App when register account

![sign_up](./public/img/signup_step.png)
