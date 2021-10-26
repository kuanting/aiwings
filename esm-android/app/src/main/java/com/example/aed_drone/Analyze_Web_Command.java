package com.example.aed_drone;

import android.os.Handler;
import android.text.format.DateFormat;
import android.util.Log;

import org.json.JSONObject;

import java.util.Calendar;

public class Analyze_Web_Command {

    private static final Handler mHandler = MainActivity.mHandler;

    public static void Analyze_JSON(String msg_from_web){
        JSONObject json_msg;
        try {
            json_msg = new JSONObject(msg_from_web);
            Object jsonOb = json_msg.get("cmd");
            String web_command = String.valueOf(jsonOb);

            Calendar mCal = Calendar.getInstance();
            CharSequence date_str  = DateFormat.format("yyyy-MM-dd kk:mm:ss", mCal.getTime());
            mHandler.obtainMessage(109, date_str + ": " + web_command).sendToTarget();

            switch (web_command) {
                case "TAKEOFF":
                    Object takeoff_height = json_msg.get("altitude");
                    float height = ObjectToFloat(takeoff_height);
                    Drone_Command.TAKEOFF_FUNCTION(height);
                    break;
                case "ARM":
                    Drone_Command.ARM_DISARM_FUNCTION(1);
                    break;
                case "DISARM":
                    Drone_Command.ARM_DISARM_FUNCTION(0);
                    break;
                case "GOTO":
                    Object goTo_height = json_msg.get("altitude");
                    Object goTo_lat = json_msg.get("lat");
                    Object goTo_lng = json_msg.get("lng");
                    float altitude = ObjectToFloat(goTo_height);
                    double lat = ObjectToFloat(goTo_lat);
                    double lng = ObjectToFloat(goTo_lng);
                    Drone_Command.GOTO_FUNCTION(lat, lng, altitude);
                    break;
                case "CHANGE_SPEED":
                    Object change_speed = json_msg.get("speed");
                    float speed = ObjectToFloat(change_speed);
                    Drone_Command.CHANGE_SPEED_FUNCTION(speed);
                    break;
                case "CHANGE_YAW":
                    Object change_yaw = json_msg.get("angle");
                    float angle = ObjectToFloat(change_yaw);
                    Drone_Command.CHANGE_YAW_FUNCTION(angle);
                    break;
                // SET_MODE
                case "GUIDED":
                    Drone_Command.SET_MODE_FUNCTION(4);
                    break;
                case "RTL":
                    Drone_Command.SET_MODE_FUNCTION(6);
                    break;
                case "LAND":
                    Drone_Command.SET_MODE_FUNCTION(9);
                    break;
                // SERVO_CONTROL
                case "SERVO_UP":
                    Drone_Command.SERVO_FUNCTION(9, 600);
                    break;
                case "SERVO_DOWN":
                    Drone_Command.SERVO_FUNCTION(9, 2400);
                    break;
                case "SERVO_STOP":
                    Drone_Command.SERVO_FUNCTION(9, 1500);
                    break;
                // GIMBAL
                case "GIMBAL_FRONT_BACK":
                    Object GIMBAL_FRONT_BACK_range = json_msg.get("pwm");
                    int range_FB = ObjectToInt(GIMBAL_FRONT_BACK_range);
                    Drone_Command.SERVO_FUNCTION(10, range_FB);
                    break;
                case "GIMBAL_LEFT_RIGHT":
                    Object GIMBAL_LEFT_RIGHT_range = json_msg.get("pwm");
                    int range_LF = ObjectToInt(GIMBAL_LEFT_RIGHT_range);
                    Drone_Command.SERVO_FUNCTION(11, range_LF);
                    break;
                default:
                    Log.i("Analyze_Web_Command", "Exception WEB Command: " + web_command);
                    break;
            }
        }catch(Exception e){
            e.printStackTrace();
        }
    }

    public static int ObjectToInt(Object json_obj){
        String s = String.valueOf(json_obj);
        return Integer.parseInt(s);
    }

    public static float ObjectToFloat(Object json_obj){
        String s = String.valueOf(json_obj);
        return Float.parseFloat(s);
    }
}
