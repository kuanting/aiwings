package com.example.aed_drone;

import io.dronefleet.mavlink.common.CommandLong;
import io.dronefleet.mavlink.common.MavCmd;
import io.dronefleet.mavlink.common.MavFrame;
import io.dronefleet.mavlink.common.MissionItemInt;

public class Drone_Command {

    public static void STATUS() {
        new Thread(() -> {
            //MAVLink_MSG_ID_GLOBAL_POSITION_INT (33)
            CommandLong STATUS_Position = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(33).param2(1000000).param7(0).build();
            MAVLinkConnection.Send(STATUS_Position);
            //MAVLink_MSG_ID_BATTERY_STATUS (147)
            CommandLong STATUS_Battery = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(147).param2(1000000).param7(0).build();
            MAVLinkConnection.Send(STATUS_Battery);
            //MAVLink_MSG_ID_VFR_HUD (74)
            CommandLong STATUS_Speed = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(74).param2(1000000).param7(0).build();
            MAVLinkConnection.Send(STATUS_Speed);
            //MAVLink_MSG_ID_SYS_STATUS (1)
            CommandLong STATUS_System = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(1).param2(1000000).param7(0).build();
            MAVLinkConnection.Send(STATUS_System);
            //MAVLink_MSG_ID_ATTITUDE (30)
            CommandLong STATUS_Attitude = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(30).param2(1000000).param7(0).build();
            MAVLinkConnection.Send(STATUS_Attitude);
            //MAVLink_MSG_ID_GPS_RAW_INT (24)
            CommandLong STATUS_gps = new CommandLong.Builder().command(MavCmd.MAV_CMD_SET_MESSAGE_INTERVAL).param1(24).param2(1000000).param7(0).build();
            MAVLinkConnection.Send(STATUS_gps);
        }).start();
    }

    public static void ARM_DISARM_FUNCTION(int is_armed) {
        new Thread(() -> {
            CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_COMPONENT_ARM_DISARM).param1(is_armed).build();
            MAVLinkConnection.Send(cmd);
        }).start();
    }

    public static void TAKEOFF_FUNCTION(float alt) {
        new Thread(() -> {
            CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_NAV_TAKEOFF).param7(alt).build();
            MAVLinkConnection.Send(cmd);
        }).start();
    }

    public static void SET_MODE_FUNCTION(int mode_name) {
        new Thread(() -> {
            // param1 = baseMode(MavModeFlag.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED)
            CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_DO_SET_MODE).param1(1).param2(mode_name).build();
            MAVLinkConnection.Send(cmd);
        }).start();
    }

    public static void CHANGE_SPEED_FUNCTION(float speed) {
        new Thread(() -> {
            CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_DO_CHANGE_SPEED).param1(0).param2(speed).param3(-1).build();
            MAVLinkConnection.Send(cmd);
        }).start();
    }

    public static void CHANGE_YAW_FUNCTION(float angle) {
        new Thread(() -> {
            CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_CONDITION_YAW).param1(angle).param2(45).param3(1).param4(0).build();
            MAVLinkConnection.Send(cmd);
        }).start();
    }

    public static void GOTO_FUNCTION(double lat, double lng, float alt) {
        new Thread(() -> {
            int lat_ = (int) (lat * 1e7);
            int lng_ = (int) (lng * 1e7);
            MissionItemInt mission = new MissionItemInt.Builder().frame(MavFrame.MAV_FRAME_GLOBAL_RELATIVE_ALT).command(MavCmd.MAV_CMD_NAV_WAYPOINT).current(2).autocontinue(1).x(lat_).y(lng_).z(alt).build();
            MAVLinkConnection.Send(mission);
        }).start();
    }

    public static void SERVO_FUNCTION(int pin, int PWM) {
        new Thread(() -> {
            CommandLong cmd = new CommandLong.Builder().command(MavCmd.MAV_CMD_DO_SET_SERVO).param1(pin).param2(PWM).build();
            MAVLinkConnection.Send(cmd);
        }).start();
    }
}
