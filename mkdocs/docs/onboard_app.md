# AI Wings Android APP for ArduPilot

This is the embedded drone control software of AI Wings, which is based on Android. The APP connects to the drone cloud via internet and communicates with ArduPilot (Pixhawk) using MAVLINK protocol. It also includes WebRTC for video streamining.  

## Test APP with ArduPilot software simulator

- [Build ArduPilot SITL](#A)
- [How to use](#B)
- [MAVLink Command Usage](#C)
- [DEMO Video](#D)
- [Reference](#E)

## *<a id="A">Build ArduPilot SITL</a>*
1. ***If you use Linux pls skip this step***, Install WSL (Win10 Subsystem).
2. Follow https://ardupilot.org/dev/docs/building-setup-linux.html#building-setup-linux to set up the SITL environment.
3. Follow https://github.com/ArduPilot/ardupilot/blob/master/BUILD.md to build the SITL source code. ***I use ./waf configure --board sitl***
4. ***If you use Linux pls skip this step***, Download https://sourceforge.net/projects/vcxsrv/ to visualize the Linux windows.
5. Input the command ***<sim_vehicle.py -v ArduCopter --console>*** on WSL terminal to run SITL. ***Input command <sim_vehicle.py -h> to see how to use the exist parameters.***
6. Open ***Mission Planner*** or ***QGroundControl*** to control and monitor the virtual drone.

## *<a id="B">How to use</a>*

1. Select ***"USB"*** option and ***connect to Pixhawk*** via USB or select ***"TCP"*** and ***connect to SITL*** via networks. ***If successful, "Pixhawk Status"*** will be displayed ***"Connected..."***.
2. The ***"RABBITMQ" button*** is used to connecnt to the pre-built RabbitMQ broker. If successful, ***"RabbitMQ Status"*** will be displayed ***"Connected..."***.
3. The ***"WEBRTC" button*** is used to establish PeerConnection of WebRTC with the back-end control webpage

### Reference

★ If you want to use USBCamera rather than Android Phone's built-in Camera. You can change the boolean value from ```MainActivity.java```.
```java=0
boolean isUsingUSBCamera = true;
```

★ If you want to modify the IP & port of ArduPilot SITL. You can change the code from ```MAVLinkConnection.java```.
```java=0
socket = new Socket("192.168.2.230", 5762);
```
★ You can change the RabbitMQ IP & port and user name & pwd from ```RabbitMQ.java```.
```java=0
ConnectionFactory factory = new ConnectionFactory();
factory.setHost("aiotlab-drone-cloud.ga");
factory.setPort(5672);
factory.setUsername("aiotlab");
factory.setPassword("aiotlab208");
```

## *<a id="C">MAVLink Command Usage</a>*
### :memo: Control Drone

### ★ Arm & Disarm
#### Bulid a **COMMAND_LONG (#76)** Message and use **MAV_CMD_COMPONENT_ARM_DISARM (400)** command.
```java=0
CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_COMPONENT_ARM_DISARM).param1(is_armed).param2(0).build();
connection.send1(255,0, cmd);

| is_armed | Status |
| ---------| -------|
| 0        | DISARM |
| 1        | ARM    |
```
### ★ TakeOff
#### Bulid a **COMMAND_LONG (#76)** Message and use **MAV_CMD_NAV_TAKEOFF (22)** command.
```java=0
CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_NAV_TAKEOFF).param1(15).param2(0).param3(0).param4(0).param5(0).param6(0).param7(takeoff_alt).build();
connection.send1(255,0, cmd);
```
### ★ Set Flight Mode
#### Bulid a **COMMAND_LONG (#76)** Message and use **MavCmd.MAV_CMD_DO_SET_MODE (176)** command.
```java=0
CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_DO_SET_MODE).param1(1).param2(CustomMode).build();
connection.send1(255, 0, cmd);

| CustomMode | FlightMode |
| ---------- | -----------|
| 0          | STABILIZE  |
| 1          | ACRO       |
| 2          | ALT_HOLD   |
| 3          | AUTO       |
| 4          | GUIDED     |
| 5          | LOITER     |
| 6          | RTL        |
| 7          | CIRCLE     |
| 9          | LAND       |
```
### ★ Change Flight Speed
#### Bulid a **COMMAND_LONG (#76)** Message and use **MAV_CMD_DO_CHANGE_SPEED (178)** command.
```java=0
CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_DO_CHANGE_SPEED).param1(0).param2(speed).param3(-1).param4(0).build();
connection.send1(255,0, cmd);
```

### ★ Change Flight Yaw
#### Bulid a **COMMAND_LONG (#76)** Message and use **MAV_CMD_CONDITION_YAW (115)** command.
```java=0
CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_CONDITION_YAW).param1(angle).param2(1).param3(-1).build();
connection.send1(255, 0, cmd);
```

### ★ Control Servo
#### Bulid a **COMMAND_LONG (#76)** Message and use **MAV_CMD_DO_SET_SERVO (183)** command.
```java=0
CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_DO_SET_SERVO).param1(pin).param2(PWM).build();
connection.send1(255,0, cmd);
```

### ★ Go to
#### Bulid a **MISSION_ITEM (#39)** Message and use **MAV_CMD_NAV_WAYPOINT (16)** command.
```java=0
MissionItem mission = new MissionItem.Builder().command(MavCmd.MAV_CMD_NAV_WAYPOINT).targetSystem(0).targetComponent(0).seq(0).current(2).autocontinue(0).frame(MavFrame.MAV_FRAME_GLOBAL_RELATIVE_ALT).x(lat).y(lng).z(alt).build();
connection.send1(255,0, mission);
```

### :memo: Receive  Flight Message
★ Bulid a **COMMAND_LONG (#76)** Message and use **MAV_CMD_SET_MESSAGE_INTERVAL (511)** command to listen the message you want and set the transmission interval.
```java=0
//MAVLINK_MSG_ID_GLOBAL_POSITION_INT 33
CommandLong STATUS_Position = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(33).param2(1000000).param7(0).build();
connection.send1(255, 0, STATUS_Position);

//MAVLINK_MSG_ID_BATTERY_STATUS 147
CommandLong STATUS_Battery = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(147).param2(1000000).param7(0).build();
connection.send1(255, 0, STATUS_Battery);

//MAVLINK_MSG_ID_VFR_HUD 74
CommandLong STATUS_Speed = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(74).param2(1000000).param7(0).build();
connection.send1(255, 0, STATUS_Speed);

//MAVLINK_MSG_ID_SYS_STATUS 1
CommandLong STATUS_System = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(1).param2(1000000).param7(0).build();
connection.send1(255, 0, STATUS_System);

//MAVLINK_MSG_ID_ATTITUDE 30
CommandLong STATUS_Attitude = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(30).param2(1000000).param7(0).build();
connection.send1(255, 0, STATUS_Attitude);

//MAVLINK_MSG_ID_GPS_RAW_INT 24
CommandLong STATUS_gps = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(24).param2(1000000).param7(0).build();
connection.send1(255, 0, STATUS_gps);
```
| msg                 | msg_id | Link                 |
| ------------------- | ------ | -------------------- |
| HEARTBEAT           | 0      | [:link:][HEARTBEAT]  |
| GLOBAL_POSITION_INT | 33     | [:link:][POSITION]   |
| VFR_HUD             | 74     | [:link:][VFR_HUD]    |
| SYS_STATUS          | 1      | [:link:][SYS_STATUS] | 
| ATTITUDE            | 30     | [:link:][ATTITUDE]   |
| GPS_RAW_INT         | 24     | [:link:][GPS_RAW_INT]|

[HEARTBEAT]: https://mavlink.io/en/messages/common.html#HEARTBEAT
[POSITION]: https://mavlink.io/en/messages/common.html#GLOBAL_POSITION_INT
[VFR_HUD]: https://mavlink.io/en/messages/common.html#VFR_HUD
[SYS_STATUS]: https://mavlink.io/en/messages/common.html#SYS_STATUS
[ATTITUDE]: https://mavlink.io/en/messages/common.html#ATTITUDE
[GPS_RAW_INT]: https://mavlink.io/en/messages/common.html#GPS_RAW_INT

★ You can receive and handle drone's message from ```Drone_Message.java```. Take ***GLOBAL_POSITION_INT ( #33 )*** as an example.

```java=0
// GLOBAL_POSITION_INT ( #33 )
else if(message.getPayload() instanceof GlobalPositionInt){
    MavlinkMessage<GlobalPositionInt> positionMessage = (MavlinkMessage<GlobalPositionInt>)message;
    String payload = "" + positionMessage.getPayload();
    String[] payload_GlobalPositionInt = payload.replaceAll("[^\\d-.,E]", "").split(",");
    String lat_ = payload_GlobalPositionInt[1];
    String lng_ = payload_GlobalPositionInt[2];
    String alt_ = payload_GlobalPositionInt[3];
    String relative_alt_ = payload_GlobalPositionInt[4];
    String heading_ = payload_GlobalPositionInt[8];
    try{
        lat = String.valueOf(Double.parseDouble(lat_) / 10000000);
        lng = String.valueOf(Double.parseDouble(lng_) / 10000000);
        alt = String.valueOf(Double.parseDouble(alt_) / 1000);
        relative_alt = String.valueOf(Double.parseDouble(relative_alt_) / 1000);
        heading = String.valueOf(Double.parseDouble(heading_) / 100);
    }catch(NumberFormatException e){
        e.printStackTrace();
    }
    Log.i("Drone_Message", "GLOBAL_POSITION_INT: " + lat + " " + lng + " " + alt + " " + relative_alt + " " + heading);
}
```

### :memo: Custom Drone Message

```json=0
{
  "type": "message",
  "drone_info": {
    "timestamp": "2020-12-23 22:43:01",
    "drone_id" : "c756023fc7039ee5"
    "location": {
      "lat": "25.0430116",
      "lng": "121.536214",
      "alt": "13.04",
      "relative_alt": "3.003",
      "heading": "95.42"
    },
    "battery": {
      "voltage": "12.587",
      "current": "28.16",
      "percentage": "0"
    },
    "speed": {
      "air_speed": "0.01",
      "gnd_speed": "0.10"
    },
    "attitude": {
      "roll": "-0.38",
      "pitch": "-0.40",
      "yaw": "95.42"
    },
    "gps_status": {
      "fix_type": "GPS_FIX_TYPE_RTK_FIXED",
      "hpop": "1.21",
      "vdop": "2.00",
      "cog": "22054",
      "gps_count": "10"
    },
    "heartbeat": {
      "mav_type": "MAV_TYPE_QUADROTOR",
      "mav_autopilot": "MAV_AUTOPILOT_ARDUPILOTMEGA",
      "flight_mode": "GUIDED",
      "system_status": "MAV_STATE_ACTIVE",
      "is_armed": "1"
    }
  }
}
```

#### :pushpin: **location** Message from **GLOBAL_POSITION_INT (#33)** Message

| location     | description                     | 
| ------------ | -----------                     | 
| lat          | Latitude                        | 
| lng          | Longitude                       |
| alt          | Altitude (MSL)                  |
| relative_alt | Altitude above ground           |
| heading      | Vehicle heading (0~360 degrees) |

#### :pushpin: **battery** Message from **SYS_STATUS (#1)** Message

| battery      | description              | 
| ------------ | -----------              | 
| voltage      | Battery voltage          | 
| current      | Battery current          |
| percentage   | Battery energy remaining |


#### :pushpin: **speed** Message from **VFR_HUD (#74)** Message

| speed        | description             | 
| ------------ | -----------             | 
| airspeed     | Current air speed       | 
| groundspeed  | Current ground speed    |

#### :pushpin: **attitude** Message from **ATTITUDE (#30)** Message

| attitude     | description            | 
| ------------ | -----------            | 
| row     | Roll angle (-pi..+pi)       | 
| pitch   | Pitch angle (-pi..+pi)      |
| yaw     | Yaw angle (-pi..+pi)        |

#### :pushpin: **gps_status** Message from **GPS_RAW_INT (#24)** Message

| gps_status | description                              | 
| ---------- | -----------                              | 
| fix_type   | GPS fix type                             | 
| hpop       | GPS HDOP horizontal dilution of position |
| vdop       | GPS VDOP vertical dilution of position   |
| cog        | Course over ground (0.0..359.99 degrees) |
| gps_count  | Number of satellites visible             |

#### :pushpin: **heartbeat** Message from **HEARTBEAT (#0)** Message

| heartbeat     | description                                        | 
| ------------  | -----------                                        | 
| mav_type      | Vehicle or component type                          | 
| mav_autopilot | Autopilot type / class                             |
| flight_mode   | Current Flight mode                                |
| system_status | System status flag                                 |
| is_armed      | Whether the drone is armed (0 : Disarmed 1 : Armed)|

## *<a id="D">DEMO video</a>*

https://youtu.be/Q5ktT4_TEg4

## *<a id="E">Reference</a>*

1. https://github.com/dronefleet/mavlink
2. https://github.com/felHR85/UsbSerial

