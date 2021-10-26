package com.example.aed_drone;

import android.os.Handler;
import android.text.format.DateFormat;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;

import io.dronefleet.mavlink.MavlinkMessage;
import io.dronefleet.mavlink.common.Attitude;
import io.dronefleet.mavlink.common.CommandAck;
import io.dronefleet.mavlink.common.GlobalPositionInt;
import io.dronefleet.mavlink.common.GpsRawInt;
import io.dronefleet.mavlink.common.Heartbeat;
import io.dronefleet.mavlink.common.MissionAck;
import io.dronefleet.mavlink.common.Statustext;
import io.dronefleet.mavlink.common.SysStatus;
import io.dronefleet.mavlink.common.VfrHud;

public class Drone_Message {

    static String lat = null, lng = null , alt = null , relative_alt = null, heading = null;
    static String volt = null, current = null , percentage = null;
    static String air_speed = null, gnd_speed = null;
    static String roll = null, pitch = null, yaw = null;
    static String fixType = null, eph = null, epv = null, cog = null, satellitesVisible = null;
    static String mav_type = null, mav_autopilot = null, system_status = null, flight_mode = null;
    static Character arm_disarm = null;
    static String what_cmd = null, cmd_result;
    static String status_txt = null;
    static String mission_result = null;

    private final Handler mHandler = MainActivity.mHandler;
    private final static String deviceID = MainActivity.device_ID;

    public void Message_classify(MavlinkMessage message){
        // HEARTBEAT ( #0 )
        if (message.getPayload() instanceof Heartbeat) {
            MavlinkMessage<Heartbeat> heartbeatMessage = (MavlinkMessage<Heartbeat>)message;
            String payload = "" + heartbeatMessage.getPayload();
            String[] payload_Heartbeat = payload.split(",");
            String mav_type_ = payload_Heartbeat[1].replaceAll("[^A-Z_]", "");
            if(mav_type_.equals("MAV_TYPE_QUADROTOR"))
            {
                mav_type = payload_Heartbeat[1].replaceAll("[^A-Z_]", "");
                mav_autopilot = payload_Heartbeat[3].replaceAll("[^A-Z_]", "");
                String base_mode = payload_Heartbeat[4].replaceAll("[^\\d-.,]", "");
                String custom_mode = payload_Heartbeat[6].replaceAll("[^\\d-.,]", "");
                system_status = payload_Heartbeat[8].replaceAll("[^A-Z_]", "");
                flight_mode = MODE_TYPE(custom_mode);
                String base_mode_msg = Integer.toBinaryString(Integer.parseInt(base_mode));
                while(base_mode_msg.length() < 8){
                    base_mode_msg = "0" + base_mode_msg;
                }
                arm_disarm = base_mode_msg.charAt(0);
                Log.i("Drone_Message", "HEARTBEAT: " + mav_type + " " + mav_autopilot + " " + flight_mode + " " + system_status + " " + arm_disarm);
            }
        }
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
        // SYS_STATUS ( #1 )
        else if(message.getPayload() instanceof SysStatus){
            MavlinkMessage<SysStatus> sysMessage = (MavlinkMessage<SysStatus>)message;
            String payload = "" + sysMessage.getPayload();
            String[] payload_SysStatus = payload.replaceAll("[^\\d-.,E]", "").split(",");
            String volt_ = payload_SysStatus[7];
            String current_ = payload_SysStatus[8];
            percentage = payload_SysStatus[9];
            try{
                volt = String.valueOf(Double.parseDouble(volt_) / 1000);
                current = String.valueOf(Double.parseDouble(current_) / 100);
            }catch(NumberFormatException e){
                e.printStackTrace();
            }
            Log.i("Drone_Message", "SYS_STATUS: " + volt + " " + current + " " + percentage);
        }
        // VFR_HUD ( #74 )
        else if(message.getPayload() instanceof VfrHud){
            MavlinkMessage<VfrHud> speedMessage = (MavlinkMessage<VfrHud>)message;
            String payload = "" + speedMessage.getPayload();
            String[] payload_VfrHud = payload.replaceAll("[^\\d-.,E]", "").split(",");
            String air_speed_ = payload_VfrHud[0];
            String gnd_speed_ = payload_VfrHud[1];
            try{
                air_speed = new java.text.DecimalFormat("0.00").format(Double.parseDouble(air_speed_));
                gnd_speed = new java.text.DecimalFormat("0.00").format(Double.parseDouble(gnd_speed_));
            }catch(NumberFormatException e){
                e.printStackTrace();
            }
            Log.i("Drone_Message", "VFR_HUD: " + air_speed + " " + gnd_speed);
        }
        // ATTITUDE ( #30 )
        else if(message.getPayload() instanceof Attitude){
            MavlinkMessage<Attitude> attitudeMessage = (MavlinkMessage<Attitude>)message;
            String payload = "" + attitudeMessage.getPayload();
            String[] payload_Attitude = payload.replaceAll("[^\\d-.,E]", "").split(",");
            String roll_ = payload_Attitude[1];
            String pitch_ = payload_Attitude[2];
            String yaw_ = payload_Attitude[3];
            try{
                roll = new java.text.DecimalFormat("0.00").format(Double.parseDouble(roll_) * 57.29);
                pitch = new java.text.DecimalFormat("0.00").format(Double.parseDouble(pitch_) * 57.29);
                yaw = new java.text.DecimalFormat("0.00").format(Double.parseDouble(yaw_) * 57.29);
            }catch(NumberFormatException e){
                e.printStackTrace();
            }
            Log.i("Drone_Message", "ATTITUDE: " + roll + " " + pitch + " " + yaw);
        }
        // GPS_RAW_INT ( #24 )
        else if(message.getPayload() instanceof GpsRawInt){
            MavlinkMessage<GpsRawInt> gpsMessage = (MavlinkMessage<GpsRawInt>)message;
            String payload = "" + gpsMessage.getPayload();
            String[] payload_GPS = payload.replaceAll("[^\\d-.,]", "").split(",");
            fixType = payload.split(",")[2].replaceAll("[^A-Z_]", "");
            String eph_ = payload_GPS[6];
            String epv_ = payload_GPS[7];
            cog = payload_GPS[9];
            satellitesVisible = payload_GPS[10];
            try{
                eph = new java.text.DecimalFormat("0.00").format(Double.parseDouble(eph_) / 100);
                epv = new java.text.DecimalFormat("0.00").format(Double.parseDouble(epv_) / 100);
            }catch(NumberFormatException e){
                e.printStackTrace();
            }
            Log.i("Drone_Message", "GPS_RAW_INT: " + fixType + " " + eph + " " + epv + " " + cog + " " + satellitesVisible);
        }
        // COMMAND_ACK ( #77 )
        else if(message.getPayload() instanceof CommandAck){
            MavlinkMessage<CommandAck> cmdMessage = (MavlinkMessage<CommandAck>)message;
            String payload = "" + cmdMessage.getPayload();
            String[] payload_CommandAck = payload.replaceAll("[^A-Z_a-z,=]", "").split(",");
            String[] what_cmd_ = payload_CommandAck[1].split("=");
            what_cmd = what_cmd_[1];
            String[] cmd_result_ = payload_CommandAck[3].split("=");
            cmd_result = cmd_result_[1];

            JSONObject cmd_ack = new JSONObject();
            try {
                cmd_ack.put("type", "cmd_ack");
                cmd_ack.put("cmd", what_cmd);
                cmd_ack.put("cmd_result", cmd_result);
            }
            catch (JSONException e) {
                e.printStackTrace();
            }
            RabbitMQ.RabbitMQ_PUBLISH_CMD_ACK(cmd_ack.toString());
            Log.i("Drone_Message", "COMMAND_ACK: "+ what_cmd + " " + cmd_result);

            Calendar mCal = Calendar.getInstance();
            CharSequence s = DateFormat.format("yyyy-MM-dd kk:mm:ss", mCal.getTime());
            mHandler.obtainMessage(110, s + ": " + what_cmd + " " + cmd_result).sendToTarget();
        }
        // STATUSTEXT ( #256 )
        else if(message.getPayload() instanceof Statustext){
            MavlinkMessage<Statustext> Statustext_Message = (MavlinkMessage<Statustext>)message;
            String payload = "" + Statustext_Message.getPayload();
            String[] payload_StatusText = payload.replaceAll("[^A-Z_a-z,= ]", "").split(",");
            String[] status_txt_ = payload_StatusText[2].trim().split("=");
            status_txt = status_txt_[1];

            JSONObject cmd_apm_text = new JSONObject();
            try {
                cmd_apm_text.put("type", "apm_text");
                cmd_apm_text.put("text", status_txt);
            }
            catch (JSONException e) {
                e.printStackTrace();
            }
            RabbitMQ.RabbitMQ_PUBLISH_APM_TEXT(cmd_apm_text.toString());
            Log.i("Drone_Message", "APM_TEXT: " + status_txt);
        }
        // MISSION_ACK ( #47 )
        else if(message.getPayload() instanceof MissionAck){
            MavlinkMessage<MissionAck> MissionAck_Message = (MavlinkMessage<MissionAck>)message;
            String payload = "" + MissionAck_Message.getPayload();
            String[] payload_MissionAck = payload.replaceAll("[^A-Z_a-z,= ]", "").split(",");
            String[] mission_result_ = payload_MissionAck[3].trim().split("=");
            mission_result = mission_result_[1];

            JSONObject mission_ack = new JSONObject();
            try {
                mission_ack.put("type", "mission_ack");
                mission_ack.put("mission_result", mission_result);
            }
            catch (JSONException e) {
                e.printStackTrace();
            }
            RabbitMQ.RabbitMQ_PUBLISH_MISSION_ACK(mission_ack.toString());
            Log.i("Drone_Message", "MissionAck: " + mission_result);
        }
        else{
            Log.i("Drone_Message", "Exception: " + message.toString());
        }
    }

    public static JSONObject PacketToJson(){

        JSONObject drone_json = new JSONObject();
        JSONObject location = new JSONObject();
        JSONObject battery = new JSONObject();
        JSONObject speed = new JSONObject();
        JSONObject attitude = new JSONObject();
        JSONObject gps = new JSONObject();
        JSONObject heartbeat = new JSONObject();

        Calendar mCal = Calendar.getInstance();
        CharSequence s = DateFormat.format("yyyy-MM-dd kk:mm:ss", mCal.getTime());
        try {
            location.put("lat", lat);
            location.put("lng", lng);
            location.put("alt", alt);
            location.put("relative_alt", relative_alt);
            location.put("heading", heading);

            battery.put("voltage", volt);
            battery.put("current", current);
            battery.put("percentage", percentage);

            speed.put("air_speed", air_speed);
            speed.put("gnd_speed", gnd_speed);

            attitude.put("roll", roll);
            attitude.put("pitch", pitch);
            attitude.put("yaw", yaw);

            gps.put("fix_type", fixType);
            gps.put("hpop", eph);
            gps.put("vdop", epv);
            gps.put("cog", cog);
            gps.put("gps_count", satellitesVisible);

            heartbeat.put("mav_type", mav_type);
            heartbeat.put("mav_autopilot", mav_autopilot);
            heartbeat.put("flight_mode", flight_mode);
            heartbeat.put("system_status", system_status);
            heartbeat.put("is_armed", String.valueOf(arm_disarm));

            drone_json.put("timestamp", s);
            drone_json.put("drone_id", deviceID);
            drone_json.put("location", location);
            drone_json.put("battery", battery);
            drone_json.put("speed", speed);
            drone_json.put("attitude", attitude);
            drone_json.put("gps_status", gps);
            drone_json.put("heartbeat", heartbeat);

        }catch (JSONException e) {
            e.printStackTrace();
        }
        return drone_json;
    }

    public String MODE_TYPE(String num){
        switch (num){
            case "0":
                return "STABILIZE";
            case "1":
                return "ACRO";
            case "2":
                return "ALT_HOLD";
            case "3":
                return "AUTO";
            case "4":
                return "GUIDED";
            case "5":
                return "LOITER";
            case "6":
                return "RTL";
            case "7":
                return "CIRCLE";
            case "8":
                return "POSITION";
            case "9":
                return "LAND";
        }
        return "ERROR";
    }
}
