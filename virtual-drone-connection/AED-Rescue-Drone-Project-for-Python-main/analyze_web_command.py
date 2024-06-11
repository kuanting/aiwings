from __future__ import print_function
import json
from drone_command import Drone_command

def analyze_web_json(vehicle, msg_from_web):

    msg_from_web_ = msg_from_web.decode("utf-8") 
    msg_from_web_dict = json.loads(msg_from_web_)

    if msg_from_web_dict['cmd'] == "TAKEOFF":
        takeoff_height = msg_from_web_dict['altitude']
        Drone_command.SET_MODE(vehicle, 4)
        Drone_command.ARM_DISARM(vehicle, 1)
        Drone_command.TAKEOFF(vehicle, float(takeoff_height))

    elif msg_from_web_dict['cmd'] == "ARM":
        Drone_command.ARM_DISARM(vehicle, 1)

    elif msg_from_web_dict['cmd'] == "DISARM":
        Drone_command.ARM_DISARM(vehicle, 0)

    elif msg_from_web_dict['cmd'] == "GOTO":
        goTo_height = float(msg_from_web_dict['altitude'])
        goTo_lat= float(msg_from_web_dict['lat'])
        goTo_lng = float(msg_from_web_dict['lng'])
        Drone_command.GOTO(vehicle, goTo_lat, goTo_lng, goTo_height)

    elif msg_from_web_dict['cmd'] == "CHANGE_SPEED":
        change_speed = float(msg_from_web_dict['speed'])
        Drone_command.CHANGE_SPEED(vehicle, change_speed)

    elif msg_from_web_dict['cmd'] == "CHANGE_YAW":
        change_angle = float(msg_from_web_dict['angle'])
        Drone_command.CHANGE_YAW(vehicle, change_angle)

    elif msg_from_web_dict['cmd'] == "GUIDED":
        Drone_command.SET_MODE(vehicle, 4)

    elif msg_from_web_dict['cmd'] == "RTL":
        Drone_command.SET_MODE(vehicle, 6)

    elif msg_from_web_dict['cmd'] == "LAND":
        Drone_command.SET_MODE(vehicle, 9)

    elif msg_from_web_dict['cmd'] == "SERVO_UP":
        Drone_command.SERVO(vehicle, 9, 600)

    elif msg_from_web_dict['cmd'] == "SERVO_DOWN":
        Drone_command.SERVO(vehicle, 9, 2400)

    elif msg_from_web_dict['cmd'] == "SERVO_STOP":
        Drone_command.SERVO(vehicle, 9, 1500)

    elif msg_from_web_dict['cmd'] == "GIMBAL_FRONT_BACK":
        range_ = int(msg_from_web_dict['pwm'])
        Drone_command.SERVO(vehicle, 10, range_)

    elif msg_from_web_dict['cmd'] == "GIMBAL_LEFT_RIGHT":
        range_ = int(msg_from_web_dict['pwm'])
        Drone_command.SERVO(vehicle, 11, range_)

    else:
        print('Analyze_web_command Error...')
