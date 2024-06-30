# AED Rescue Drone Project for Python

- [Build ArduPilot SITL](#A)
- [Control Program](#B)
- [WebRTC + AirSim](#C)
- [Test Environment](#D)
- [DEMO Video](#E)
- [Reference](#F)

## *<a id="A">Build ArduPilot SITL</a>*
1. ***If you use Linux pls skip this step***, Install WSL (Win10 Subsystem).
2. Follow https://ardupilot.org/dev/docs/building-setup-linux.html#building-setup-linux to setup the SITL environment.
3. Follow https://github.com/ArduPilot/ardupilot/blob/master/BUILD.md to build the SITL source code. ***I use ./waf configure --board sitl***
4. ***If you use Linux pls skip this step***, Download https://sourceforge.net/projects/vcxsrv/ to visualize the Linux windows.
5. Input the command ***<sim_vehicle.py -v ArduCopter --console>*** on WSL terminal to run SITL. ***Input command <sim_vehicle.py -h> to see how to use the exist parameters.***
6. Open ***Mission Planner*** or ***QGroundControl*** to control and monitor the virtual drone.

## *<a id="B">Control Program</a>*

### Prerequisites
```
pip install dronekit
```
```
pip install pika
```
### How to use

★ Run Ardupilot SITL by using this command ***sim_vehicle.py -v ArduCopter --console --custom-location=25.043014,121.536216,10,90*** on Linux terminal.

![](https://i.imgur.com/0aSJuM0.jpg)

★ Run ```__init__.py``` 

### Reference
★ You can change the ArduPilot SITL IP & port from ```__init__.py```
```python=1
CONNECTION_STRING = '127.0.0.1:14551'
```
★ You can change the RabbitMQ IP & port and user name & pwd from ```RabbitMQ.py```
```python=1
auth = pika.PlainCredentials('aiotlab', 'aiotlab208')
parameters= pika.ConnectionParameters(host='aiotlab-drone-cloud.ga', port=5672, virtual_host='/', credentials=auth)
connection = pika.BlockingConnection(parameters)
```
★ If you want to listen additional MAVLink Message, refer to the example code from [Dronekit Github.](https://github.com/dronekit/dronekit-python/blob/master/examples/create_attribute/create_attribute.py)

***For example, GLOBAL_POSITION_INT ( #33 )***  First, add the custom class and listener in ```my_vehicle.py``` 

```python=1
class GLOBAL_POSITION_INT(object):

    def __init__(self, time_boot_us=None, lat=None, lon=None, alt=None, relative_alt=None, vx=None, vy=None, vz=None, hdg=None):
        self.time_boot_us = time_boot_us
        self.lat = lat
        self.lon = lon
        self.alt = alt
        self.relative_alt = relative_alt
        self.vx = vx
        self.vy = vy
        self.vz = vz        
        self.hdg = hdg
        
    def __str__(self):
        GLOBAL_POSITION_INT_dict = {'lat':self.lat, 'lng':self.lon, 'alt':self.alt, 'relative_alt':self.relative_alt, 'heading': self.hdg}
        GLOBAL_POSITION_INT_json = json.dumps(GLOBAL_POSITION_INT_dict)
        return GLOBAL_POSITION_INT_json

```

```python=1
class MyVehicle(Vehicle):
    def __init__(self, *args):
        super(MyVehicle, self).__init__(*args)

        # GLOBAL_POSITION_INT
        self._GLOBAL_POSITION_INT = GLOBAL_POSITION_INT()
        @self.on_message('GLOBAL_POSITION_INT')
        def listener(self, name, message):

            self._GLOBAL_POSITION_INT.time_boot_us = message.time_boot_ms
            self._GLOBAL_POSITION_INT.lat = message.lat / 1.0e7
            self._GLOBAL_POSITION_INT.lon = message.lon / 1.0e7
            self._GLOBAL_POSITION_INT.alt = message.alt / 1000.0
            self._GLOBAL_POSITION_INT.relative_alt = message.relative_alt / 1000.0
            self._GLOBAL_POSITION_INT.vx = message.vx
            self._GLOBAL_POSITION_INT.vy = message.vy
            self._GLOBAL_POSITION_INT.vz = message.vz
            self._GLOBAL_POSITION_INT.hdg = message.hdg / 100

            self.notify_attribute_listeners('GLOBAL_POSITION_INT', self._GLOBAL_POSITION_INT)

```
And then add callback function in ```drone_message.py```
```python=1
def GLOBAL_POSITION_INT_callback(self, self_, attr_name, value):
    self.location = json.loads(str(value))
```
Finally, use ***add_attribute_listener*** function in ```__init__.py```
```python=1
drone = connect(CONNECTION_STRING, wait_ready=True, vehicle_class=MyVehicle)
drone_msg = Drone_message(vehicle=drone, rabbitmq=rabbitmq_producer)
drone.add_attribute_listener('GLOBAL_POSITION_INT', drone_msg.GLOBAL_POSITION_INT_callback)
```
★ If you want to use other MAVLink Command, pls refer to ```drone_command.py```, In most cases, you can use only ***COMMAND_LONG ( #76 )*** message to wrap the command you want to use and the parameters. MAVLink Command can be found in [MAVLink offcial website.](https://mavlink.io/en/messages/common.html#mav_commands)

```python=1
def ARM_DISARM(self, is_armed):
    msg = self.vehicle.message_factory.command_long_encode(
                0, 0,                                         # target system, target component
                mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, # command
                0,                                            # confirmation
                is_armed, 0                                   # param 1~2
                ,0, 0, 0, 0, 0)                               # param 3~7
    self.vehicle.send_mavlink(msg)
```
## *<a id="C">WebRTC + Airsim</a>*
### Prerequisites

Refer to https://github.com/aiortc/aiortc/tree/main/examples/webcam
```
pip install aiortc opencv-python av
```
```
pip install airsim
```
### How to use

1. Please refer to other references to understand the concept of WebRTC first and then you have to create your own signaling server and Peer B program (This program is as Peer A).
2. If you want to use ***AirSim*** virtual enviroment, you have to build AirSim in advance, or use the binary file from [AirSim Binary file](https://github.com/Microsoft/AirSim/releases), the ***settings.json*** file must to be set first, pls refer to [ArduCopter settings.json.](https://ardupilot.org/dev/docs/sitl-with-airsim.html#launch-copter-sitl)
3. After opening binary file or pressing the ***PLAY*** button in ***Unreal Engine***, input the command ***<sim_vehicle.py -v ArduCopter -f airsim-copter --console>*** on WSL terminal to connect to the AirSim.
4. ```cd AirSim_Streaming_webRTC``` & Run ```webRTC.py```

## *<a id="D">Test Environment</a>*

```
Package               Version
--------------------- -------------------
aiohttp               3.7.4.post0        
aioice                0.7.5
aiortc                1.2.0
airsim                1.3.0
async-timeout         3.0.1
async-to-sync         0.2.2
attrs                 20.3.0
av                    8.0.3
bidict                0.21.2
certifi               2020.6.20
cffi                  1.14.5
chardet               4.0.0
crc32c                2.2
cryptography          3.4.6
cycler                0.10.0
dataclasses           0.8
dnspython             2.1.0
dronekit              2.9.2
dronekit-sitl         3.3.0
future                0.18.2
idna                  3.1
idna-ssl              1.1.0
kiwisolver            1.2.0
lxml                  4.5.2
matplotlib            3.3.0
MAVProxy              1.8.20
monotonic             1.5
msgpack-python        0.5.6
msgpack-rpc-python    0.4.1
multidict             5.1.0
netifaces             0.10.9
numpy                 1.19.1
opencv-contrib-python 4.5.1.48
opencv-python         4.3.0.36
paho-mqtt             1.5.1
pika                  1.2.0
Pillow                7.2.0
pip                   20.1.1
psutil                5.7.2
pycparser             2.20
pyee                  8.1.0
pygame                1.9.6
pylibsrtp             0.6.8
pymavlink             2.4.11
pyparsing             2.4.7
pyreadline            2.1
pyserial              3.4
python-dateutil       2.8.1
python-engineio       4.1.0
python-socketio       5.2.1
pywin32               228
PyYAML                5.3.1
setuptools            49.2.0.post20200714
six                   1.15.0
syncer                1.3.0
tornado               4.5.3
typing-extensions     3.7.4.3
websockets            9.0.1
wheel                 0.34.2
wincertstore          0.2
wxPython              4.1.0
yarl                  1.6.3
```

## *<a id="E">DEMO Video</a>*

https://youtu.be/3q5TWYXFUhI

## *<a id="F">Reference</a>*

1. https://github.com/dronekit/dronekit-python
2. https://www.rabbitmq.com/tutorials/tutorial-five-python.html
3. https://github.com/aiortc/aiortc/tree/main/examples/webcam

