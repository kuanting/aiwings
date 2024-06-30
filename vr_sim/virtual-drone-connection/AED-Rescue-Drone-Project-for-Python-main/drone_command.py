from __future__ import print_function
from pymavlink import mavutil # Needed for command message definitions

class Drone_command():

    def __init__(self, vehicle=None):
        self.vehicle = vehicle

    def ARM_DISARM(self, is_armed):
        msg = self.vehicle.message_factory.command_long_encode(
                    0, 0,   # target system, target component
                    mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM, # command
                    0,          # confirmation
                    is_armed, 0       # param 1.2
                    ,0, 0, 0, 0, 0)   # param 3~7
        self.vehicle.send_mavlink(msg)

    def TAKEOFF(self, alt):
        msg = self.vehicle.message_factory.command_long_encode(
                    0, 0,       # target system, target component
                    mavutil.mavlink.MAV_CMD_NAV_TAKEOFF, # command
                    0,            # confirmation
                    0, 0, 0, 0,   # param 1~4
                    self.vehicle.location.global_relative_frame.lat,    # param 5
                    self.vehicle.location.global_relative_frame.lon,    # param 6
                    alt)   # param 7
        self.vehicle.send_mavlink(msg)

    def SET_MODE(self, mode_name):
        msg = self.vehicle.message_factory.command_long_encode(
                    0, 0,       # target system, target component
                    mavutil.mavlink.MAV_CMD_DO_SET_MODE, # command
                    0,            # confirmation
                    1,            # param 1
                    mode_name,    # param 2
                    0, 0, 0, 0, 0)   # param 3~7
        self.vehicle.send_mavlink(msg)

    def CHANGE_SPEED(self, speed):
        msg = self.vehicle.message_factory.command_long_encode(
                    0, 0,       # target system, target component
                    mavutil.mavlink.MAV_CMD_DO_CHANGE_SPEED, # command
                    0,            # confirmation
                    0,            # param 1
                    speed,        # param 2
                    -1,           # param 3
                    0, 0, 0, 0)   # param 4~7
        self.vehicle.send_mavlink(msg)

    def CHANGE_YAW(self, angle):
        msg = self.vehicle.message_factory.command_long_encode(
                    0, 0,       # target system, target component
                    mavutil.mavlink.MAV_CMD_CONDITION_YAW, # command
                    0,            # confirmation
                    angle,        # param 1
                    1,            # param 2
                    -1,           # param 3
                    0, 0, 0, 0)   # param 4~7
        self.vehicle.send_mavlink(msg)

    def GOTO(self, lat, lng, alt):

        msg = self.vehicle.message_factory.mission_item_encode(
                    0, 0,  # target system, target component
                    0,     # seq
                    mavutil.mavlink.MAV_FRAME_GLOBAL_RELATIVE_ALT, # frame
                    mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,          # command
                    2, # current
                    1, # autocontinue
                    0, 0, 0, 0, # param 1~4
                    lat, lng, alt)
        self.vehicle.send_mavlink(msg)

    def SERVO(self, pin, PWM):

        msg = self.vehicle.message_factory.command_long_encode(
                    0, 0,       # target system, target component
                    mavutil.mavlink.MAV_CMD_DO_SET_SERVO, # command
                    0,            # confirmation
                    pin,          # param 1
                    PWM,          # param 2
                    0, 0, 0, 0, 0)   # param 3~7
        self.vehicle.send_mavlink(msg)