# Streaming video from AirSim using WebRTC

This Python example shows how to stream video from AirSim using AIORTC library (WebRTC). This code is modified from
AIORTC [server](https://github.com/aiortc/aiortc/tree/main/examples/server) 
and [videostream-cli](https://github.com/aiortc/aiortc/tree/main/examples/videostream-cli). The demo is shown below:

<img src="./img/two_drones_streaming_in_airsim.png" /> 

Two drones names "drone1" and "drone2" were created in AirSim pre-built environment "Africa". A Python web server is running to provide WebRTC client. 
Open two webpages to connect to the two drones. Make sure you enter the correct Drone name or AirSim will crash.


## Running the code

Install the prerequisite libraries:
```
pip install aiohttp aiortc opencv-python
pip install airsim
```

Run the server
```
python server.py
```

Open your server's homepage at
https://127.0.0.1:8080.

## Running AirSim Environment

Run an AirSim environment and create drones with names. An example of JSON setting file that creates 2 drones is in the folder (./settings_two_drones.json).


## Connecting to the drones 

Back to your webpage, enter the drone's name and click "start" button. You will see the video of the drone after few seconds. Make sure you enter the right name of the drone, or AirSi may crash.