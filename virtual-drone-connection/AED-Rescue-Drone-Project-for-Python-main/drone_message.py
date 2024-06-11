from __future__ import print_function
import json
import time

from config import DRONE_ID

class Drone_message():

    def __init__(self, vehicle=None, timestamp=None, location=None, battery=None, speed=None, attitude=None, gps_status=None, heartbeat=None,
                 cmd_ack=None, status_text=None, mission_ack=None, rabbitmq=None):
        self.vehicle = vehicle
        self.timestamp = timestamp
        self.location = location
        self.battery = battery
        self.speed = speed
        self.attitude = attitude
        self.gps_status = gps_status
        self.heartbeat = heartbeat
        self.cmd_ack = cmd_ack
        self.status_text = status_text
        self.mission_ack = mission_ack

        self.rabbitmq = rabbitmq

    def GLOBAL_POSITION_INT_callback(self, self_, attr_name, value):
        self.location = json.loads(str(value))

    def SYS_STATUS_callback(self, self_, attr_name, value):
        self.battery = json.loads(str(value))

    def VFR_HUD_callback(self, self_, attr_name, value):
        self.speed = json.loads(str(value))

    def ATTITUDE_callback(self, self_, attr_name, value):
        self.attitude = json.loads(str(value))

    def GPS_RAW_INT_callback(self, self_, attr_name, value):
        self.gps_status = json.loads(str(value))

    def HEARTBEAT_callback(self, self_, attr_name, value):
        self.heartbeat = json.loads(str(value))

    def COMMAND_ACK_callback(self, self_, attr_name, value):
        self.cmd_ack = json.loads(str(value))
        self.PacketTojson_Publish_COMMAND_ACK(self.cmd_ack)

    def STATUS_TEXT_callback(self, self_, attr_name, value):
        self.status_text = json.loads(str(value))
        self.PacketTojson_Publish_APM_TEXT(self.status_text)

    def MISSION_ACK_callback(self, self_, attr_name, value):
        self.mission_ack = json.loads(str(value))
        self.PacketTojson_Publish_MISSION_ACK(self.mission_ack)

    def PacketTojson_MESSAGE(self):
        self.timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
        drone_msg_dict = {'timestamp':self.timestamp, 'drone_id':DRONE_ID, 'location':self.location, 'battery':self.battery,
                        'speed':self.speed, 'attitude':self.attitude, 'gps_status':self.gps_status,
                        'heartbeat':self.heartbeat}
        drone_msg_dict_ = {'type':'message','drone_info':drone_msg_dict}
        drone_msg_json = json.dumps(drone_msg_dict_)
        return drone_msg_json

    def Publish_MESSAGE(self):
        while True:
            MESSAGE_json = self.PacketTojson_MESSAGE()
            self.rabbitmq.publish(MESSAGE_json)
            time.sleep(1)

    def PacketTojson_Publish_COMMAND_ACK(self, COMMAND_ACK):
        COMMAND_ACK_json = json.dumps(COMMAND_ACK)
        self.rabbitmq.publish(COMMAND_ACK_json)

    def PacketTojson_Publish_APM_TEXT(self, STATUS_TEXT):
        STATUS_TEXT_json = json.dumps(STATUS_TEXT)
        self.rabbitmq.publish(STATUS_TEXT_json)

    def PacketTojson_Publish_MISSION_ACK(self, MISSION_ACK):
        MISSION_ACK_json = json.dumps(MISSION_ACK)
        self.rabbitmq.publish(MISSION_ACK_json)
