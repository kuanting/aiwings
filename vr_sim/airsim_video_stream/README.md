# Streaming video from AirSim using WebRTC

This Python example shows show to stream video from AirSim using AIORTC library (WebRTC). This code is modified from
AIORTC [server](https://github.com/aiortc/aiortc/tree/main/examples/server) 
and [videostream-cli](https://github.com/aiortc/aiortc/tree/main/examples/videostream-cli).

## Running the code

Install the prerequisite libraries:
```
pip install aiohttp aiortc opencv-python
pip install airsim
```

Open your server's homepage at
https://127.0.0.1:8080

## Running AirSim Environment

Run an AirSim environment and create drones with names. A JSON setting file that creates 2 drones is in the folder (./settings_two_drones.json).


## Connecting to the drones 

Back to the server, enter the drone's name and click "start" button. You will see the video of the drone after few seconds. Make sure you enter the right name of the drone, or AirSi may crash.