from dronekit import Vehicle
import json

enums = {}

# MAV_CMD
enums['MAV_CMD'] = {}
enums['MAV_CMD'][16] = 'MAV_CMD_NAV_WAYPOINT'
enums['MAV_CMD'][17] = 'MAV_CMD_NAV_LOITER_UNLIM'
enums['MAV_CMD'][18] = 'MAV_CMD_NAV_LOITER_TURNS'
enums['MAV_CMD'][19] = 'MAV_CMD_NAV_LOITER_TIME'
enums['MAV_CMD'][20] = 'MAV_CMD_NAV_RETURN_TO_LAUNCH'
enums['MAV_CMD'][21] = 'MAV_CMD_NAV_LAND'
enums['MAV_CMD'][22] = 'MAV_CMD_NAV_TAKEOFF'
enums['MAV_CMD'][23] = 'MAV_CMD_NAV_LAND_LOCAL'
enums['MAV_CMD'][24] = 'MAV_CMD_NAV_TAKEOFF_LOCAL'
enums['MAV_CMD'][25] = 'MAV_CMD_NAV_FOLLOW'
enums['MAV_CMD'][30] = 'MAV_CMD_NAV_CONTINUE_AND_CHANGE_ALT'
enums['MAV_CMD'][31] = 'MAV_CMD_NAV_LOITER_TO_ALT'
enums['MAV_CMD'][32] = 'MAV_CMD_DO_FOLLOW'
enums['MAV_CMD'][33] = 'MAV_CMD_DO_FOLLOW_REPOSITION'
enums['MAV_CMD'][80] = 'MAV_CMD_NAV_ROI'
enums['MAV_CMD'][81] = 'MAV_CMD_NAV_PATHPLANNING'
enums['MAV_CMD'][82] = 'MAV_CMD_NAV_SPLINE_WAYPOINT'
enums['MAV_CMD'][83] = 'MAV_CMD_NAV_ALTITUDE_WAIT'
enums['MAV_CMD'][84] = 'MAV_CMD_NAV_VTOL_TAKEOFF'
enums['MAV_CMD'][85] = 'MAV_CMD_NAV_VTOL_LAND'
enums['MAV_CMD'][92] = 'MAV_CMD_NAV_GUIDED_ENABLE'
enums['MAV_CMD'][93] = 'MAV_CMD_NAV_DELAY'
enums['MAV_CMD'][94] = 'MAV_CMD_NAV_PAYLOAD_PLACE'
enums['MAV_CMD'][95] = 'MAV_CMD_NAV_LAST'
enums['MAV_CMD'][112] = 'MAV_CMD_CONDITION_DELAY'
enums['MAV_CMD'][113] = 'MAV_CMD_CONDITION_CHANGE_ALT'
enums['MAV_CMD'][114] = 'MAV_CMD_CONDITION_DISTANCE'
enums['MAV_CMD'][115] = 'MAV_CMD_CONDITION_YAW'
enums['MAV_CMD'][159] = 'MAV_CMD_CONDITION_LAST'
enums['MAV_CMD'][176] = 'MAV_CMD_DO_SET_MODE'
enums['MAV_CMD'][177] = 'MAV_CMD_DO_JUMP'
enums['MAV_CMD'][178] = 'MAV_CMD_DO_CHANGE_SPEED'
enums['MAV_CMD'][179] = 'MAV_CMD_DO_SET_HOME'
enums['MAV_CMD'][180] = 'MAV_CMD_DO_SET_PARAMETER'
enums['MAV_CMD'][181] = 'MAV_CMD_DO_SET_RELAY'
enums['MAV_CMD'][182] = 'MAV_CMD_DO_REPEAT_RELAY'
enums['MAV_CMD'][183] = 'MAV_CMD_DO_SET_SERVO'
enums['MAV_CMD'][184] = 'MAV_CMD_DO_REPEAT_SERVO'
enums['MAV_CMD'][185] = 'MAV_CMD_DO_FLIGHTTERMINATION'
enums['MAV_CMD'][186] = 'MAV_CMD_DO_CHANGE_ALTITUDE'
enums['MAV_CMD'][189] = 'MAV_CMD_DO_LAND_START'
enums['MAV_CMD'][190] = 'MAV_CMD_DO_RALLY_LAND'
enums['MAV_CMD'][191] = 'MAV_CMD_DO_GO_AROUND'
enums['MAV_CMD'][192] = 'MAV_CMD_DO_REPOSITION'
enums['MAV_CMD'][193] = 'MAV_CMD_DO_PAUSE_CONTINUE'
enums['MAV_CMD'][194] = 'MAV_CMD_DO_SET_REVERSE'
enums['MAV_CMD'][195] = 'MAV_CMD_DO_SET_ROI_LOCATION'
enums['MAV_CMD'][196] = 'MAV_CMD_DO_SET_ROI_WPNEXT_OFFSET'
enums['MAV_CMD'][197] = 'MAV_CMD_DO_SET_ROI_NONE'
enums['MAV_CMD'][198] = 'MAV_CMD_DO_SET_ROI_SYSID'
enums['MAV_CMD'][200] = 'MAV_CMD_DO_CONTROL_VIDEO'
enums['MAV_CMD'][201] = 'MAV_CMD_DO_SET_ROI'
enums['MAV_CMD'][203] = 'MAV_CMD_DO_DIGICAM_CONTROL'
enums['MAV_CMD'][204] = 'MAV_CMD_DO_MOUNT_CONFIGURE'
enums['MAV_CMD'][205] = 'MAV_CMD_DO_MOUNT_CONTROL'
enums['MAV_CMD'][206] = 'MAV_CMD_DO_SET_CAM_TRIGG_DIST'
enums['MAV_CMD'][207] = 'MAV_CMD_DO_FENCE_ENABLE'
enums['MAV_CMD'][208] = 'MAV_CMD_DO_PARACHUTE'
enums['MAV_CMD'][209] = 'MAV_CMD_DO_MOTOR_TEST'
enums['MAV_CMD'][210] = 'MAV_CMD_DO_INVERTED_FLIGHT'
enums['MAV_CMD'][211] = 'MAV_CMD_DO_GRIPPER'
enums['MAV_CMD'][212] = 'MAV_CMD_DO_AUTOTUNE_ENABLE'
enums['MAV_CMD'][213] = 'MAV_CMD_NAV_SET_YAW_SPEED'
enums['MAV_CMD'][214] = 'MAV_CMD_DO_SET_CAM_TRIGG_INTERVAL'
enums['MAV_CMD'][215] = 'MAV_CMD_DO_SET_RESUME_REPEAT_DIST'
enums['MAV_CMD'][220] = 'MAV_CMD_DO_MOUNT_CONTROL_QUAT'
enums['MAV_CMD'][221] = 'MAV_CMD_DO_GUIDED_MASTER'
enums['MAV_CMD'][222] = 'MAV_CMD_DO_GUIDED_LIMITS'
enums['MAV_CMD'][223] = 'MAV_CMD_DO_ENGINE_CONTROL'
enums['MAV_CMD'][224] = 'MAV_CMD_DO_SET_MISSION_CURRENT'
enums['MAV_CMD'][240] = 'MAV_CMD_DO_LAST'
enums['MAV_CMD'][241] = 'MAV_CMD_PREFLIGHT_CALIBRATION'
enums['MAV_CMD'][242] = 'MAV_CMD_PREFLIGHT_SET_SENSOR_OFFSETS'
enums['MAV_CMD'][243] = 'MAV_CMD_PREFLIGHT_UAVCAN'
enums['MAV_CMD'][245] = 'MAV_CMD_PREFLIGHT_STORAGE'
enums['MAV_CMD'][246] = 'MAV_CMD_PREFLIGHT_REBOOT_SHUTDOWN'
enums['MAV_CMD'][252] = 'MAV_CMD_OVERRIDE_GOTO'
enums['MAV_CMD'][300] = 'MAV_CMD_MISSION_START'
enums['MAV_CMD'][400] = 'MAV_CMD_COMPONENT_ARM_DISARM'
enums['MAV_CMD'][410] = 'MAV_CMD_GET_HOME_POSITION'
enums['MAV_CMD'][500] = 'MAV_CMD_START_RX_PAIR'
enums['MAV_CMD'][510] = 'MAV_CMD_GET_MESSAGE_INTERVAL'
enums['MAV_CMD'][511] = 'MAV_CMD_SET_MESSAGE_INTERVAL'
enums['MAV_CMD'][512] = 'MAV_CMD_REQUEST_MESSAGE'
enums['MAV_CMD'][520] = 'MAV_CMD_REQUEST_AUTOPILOT_CAPABILITIES'
enums['MAV_CMD'][521] = 'MAV_CMD_REQUEST_CAMERA_INFORMATION'
enums['MAV_CMD'][522] = 'MAV_CMD_REQUEST_CAMERA_SETTINGS'
enums['MAV_CMD'][525] = 'MAV_CMD_REQUEST_STORAGE_INFORMATION'
enums['MAV_CMD'][526] = 'MAV_CMD_STORAGE_FORMAT'
enums['MAV_CMD'][527] = 'MAV_CMD_REQUEST_CAMERA_CAPTURE_STATUS'
enums['MAV_CMD'][528] = 'MAV_CMD_REQUEST_FLIGHT_INFORMATION'
enums['MAV_CMD'][529] = 'MAV_CMD_RESET_CAMERA_SETTINGS'
enums['MAV_CMD'][530] = 'MAV_CMD_SET_CAMERA_MODE'
enums['MAV_CMD'][600] = 'MAV_CMD_JUMP_TAG'
enums['MAV_CMD'][601] = 'MAV_CMD_DO_JUMP_TAG'
enums['MAV_CMD'][2000] = 'MAV_CMD_IMAGE_START_CAPTURE'
enums['MAV_CMD'][2001] = 'MAV_CMD_IMAGE_STOP_CAPTURE'
enums['MAV_CMD'][2003] = 'MAV_CMD_DO_TRIGGER_CONTROL'
enums['MAV_CMD'][2500] = 'MAV_CMD_VIDEO_START_CAPTURE'
enums['MAV_CMD'][2501] = 'MAV_CMD_VIDEO_STOP_CAPTURE'
enums['MAV_CMD'][2510] = 'MAV_CMD_LOGGING_START'
enums['MAV_CMD'][2511] = 'MAV_CMD_LOGGING_STOP'
enums['MAV_CMD'][2520] = 'MAV_CMD_AIRFRAME_CONFIGURATION'
enums['MAV_CMD'][2600] = 'MAV_CMD_CONTROL_HIGH_LATENCY'
enums['MAV_CMD'][2800] = 'MAV_CMD_PANORAMA_CREATE'
enums['MAV_CMD'][3000] = 'MAV_CMD_DO_VTOL_TRANSITION'
enums['MAV_CMD'][3001] = 'MAV_CMD_ARM_AUTHORIZATION_REQUEST'
enums['MAV_CMD'][4000] = 'MAV_CMD_SET_GUIDED_SUBMODE_STANDARD'
enums['MAV_CMD'][4001] = 'MAV_CMD_SET_GUIDED_SUBMODE_CIRCLE'
enums['MAV_CMD'][5000] = 'MAV_CMD_NAV_FENCE_RETURN_POINT'
enums['MAV_CMD'][5001] = 'MAV_CMD_NAV_FENCE_POLYGON_VERTEX_INCLUSION'
enums['MAV_CMD'][5002] = 'MAV_CMD_NAV_FENCE_POLYGON_VERTEX_EXCLUSION'
enums['MAV_CMD'][5003] = 'MAV_CMD_NAV_FENCE_CIRCLE_INCLUSION'
enums['MAV_CMD'][5004] = 'MAV_CMD_NAV_FENCE_CIRCLE_EXCLUSION'
enums['MAV_CMD'][5100] = 'MAV_CMD_NAV_RALLY_POINT'
enums['MAV_CMD'][5200] = 'MAV_CMD_UAVCAN_GET_NODE_INFO'
enums['MAV_CMD'][30001] = 'MAV_CMD_PAYLOAD_PREPARE_DEPLOY'
enums['MAV_CMD'][30002] = 'MAV_CMD_PAYLOAD_CONTROL_DEPLOY'
enums['MAV_CMD'][31000] = 'MAV_CMD_WAYPOINT_USER_1'
enums['MAV_CMD'][31001] = 'MAV_CMD_WAYPOINT_USER_2'
enums['MAV_CMD'][31002] = 'MAV_CMD_WAYPOINT_USER_3'
enums['MAV_CMD'][31003] = 'MAV_CMD_WAYPOINT_USER_4'
enums['MAV_CMD'][31004] = 'MAV_CMD_WAYPOINT_USER_5'
enums['MAV_CMD'][31005] = 'MAV_CMD_SPATIAL_USER_1'
enums['MAV_CMD'][31006] = 'MAV_CMD_SPATIAL_USER_2'
enums['MAV_CMD'][31007] = 'MAV_CMD_SPATIAL_USER_3'
enums['MAV_CMD'][31008] = 'MAV_CMD_SPATIAL_USER_4'
enums['MAV_CMD'][31009] = 'MAV_CMD_SPATIAL_USER_5'
enums['MAV_CMD'][31010] = 'MAV_CMD_USER_1'
enums['MAV_CMD'][31011] = 'MAV_CMD_USER_2'
enums['MAV_CMD'][31012] = 'MAV_CMD_USER_3'
enums['MAV_CMD'][31013] = 'MAV_CMD_USER_4'
enums['MAV_CMD'][31014] = 'MAV_CMD_USER_5'
enums['MAV_CMD'][42000] = 'MAV_CMD_POWER_OFF_INITIATED'
enums['MAV_CMD'][42001] = 'MAV_CMD_SOLO_BTN_FLY_CLICK'
enums['MAV_CMD'][42002] = 'MAV_CMD_SOLO_BTN_FLY_HOLD'
enums['MAV_CMD'][42003] = 'MAV_CMD_SOLO_BTN_PAUSE_CLICK'
enums['MAV_CMD'][42004] = 'MAV_CMD_FIXED_MAG_CAL'
enums['MAV_CMD'][42005] = 'MAV_CMD_FIXED_MAG_CAL_FIELD'
enums['MAV_CMD'][42006] = 'MAV_CMD_FIXED_MAG_CAL_YAW'
enums['MAV_CMD'][42424] = 'MAV_CMD_DO_START_MAG_CAL'
enums['MAV_CMD'][42425] = 'MAV_CMD_DO_ACCEPT_MAG_CAL'
enums['MAV_CMD'][42426] = 'MAV_CMD_DO_CANCEL_MAG_CAL'
enums['MAV_CMD'][42427] = 'MAV_CMD_SET_FACTORY_TEST_MODE'
enums['MAV_CMD'][42428] = 'MAV_CMD_DO_SEND_BANNER'
enums['MAV_CMD'][42429] = 'MAV_CMD_ACCELCAL_VEHICLE_POS'
enums['MAV_CMD'][42501] = 'MAV_CMD_GIMBAL_RESET'
enums['MAV_CMD'][42502] = 'MAV_CMD_GIMBAL_AXIS_CALIBRATION_STATUS'
enums['MAV_CMD'][42503] = 'MAV_CMD_GIMBAL_REQUEST_AXIS_CALIBRATION'
enums['MAV_CMD'][42505] = 'MAV_CMD_GIMBAL_FULL_RESET'
enums['MAV_CMD'][42600] = 'MAV_CMD_DO_WINCH'
enums['MAV_CMD'][42650] = 'MAV_CMD_FLASH_BOOTLOADER'
enums['MAV_CMD'][42651] = 'MAV_CMD_BATTERY_RESET'
enums['MAV_CMD'][42700] = 'MAV_CMD_DEBUG_TRAP'
enums['MAV_CMD'][42701] = 'MAV_CMD_SCRIPTING'
enums['MAV_CMD'][43000] = 'MAV_CMD_GUIDED_CHANGE_SPEED'
enums['MAV_CMD'][43001] = 'MAV_CMD_GUIDED_CHANGE_ALTITUDE'
enums['MAV_CMD'][43002] = 'MAV_CMD_GUIDED_CHANGE_HEADING'
enums['MAV_CMD'][43003] = 'MAV_CMD_ENUM_END'

# MAV_RESULT
enums['MAV_RESULT'] = {}
enums['MAV_RESULT'][0] = 'MAV_RESULT_ACCEPTED'
enums['MAV_RESULT'][1] = 'MAV_RESULT_TEMPORARILY_REJECTED'
enums['MAV_RESULT'][2] = 'MAV_RESULT_DENIED'
enums['MAV_RESULT'][3] = 'MAV_RESULT_UNSUPPORTED'
enums['MAV_RESULT'][4] = 'MAV_RESULT_FAILED'
enums['MAV_RESULT'][5] = 'MAV_RESULT_IN_PROGRESS'
enums['MAV_RESULT'][6] = 'MAV_RESULT_ENUM_END'

# MAV_MISSION_RESULT
enums['MAV_MISSION_RESULT'] = {}
enums['MAV_MISSION_RESULT'][0] = 'MAV_MISSION_ACCEPTED'
enums['MAV_MISSION_RESULT'][1] = 'MAV_MISSION_ERROR'
enums['MAV_MISSION_RESULT'][2] = 'MAV_MISSION_UNSUPPORTED_FRAME'
enums['MAV_MISSION_RESULT'][3] = 'MAV_MISSION_UNSUPPORTED'
enums['MAV_MISSION_RESULT'][4] = 'MAV_MISSION_NO_SPACE'
enums['MAV_MISSION_RESULT'][5] = 'MAV_MISSION_INVALID'
enums['MAV_MISSION_RESULT'][6] = 'MAV_MISSION_INVALID_PARAM1'
enums['MAV_MISSION_RESULT'][7] = 'MAV_MISSION_INVALID_PARAM2'
enums['MAV_MISSION_RESULT'][8] = 'MAV_MISSION_INVALID_PARAM3'
enums['MAV_MISSION_RESULT'][9] = 'MAV_MISSION_INVALID_PARAM4'
enums['MAV_MISSION_RESULT'][10] = 'MAV_MISSION_INVALID_PARAM5_X'
enums['MAV_MISSION_RESULT'][11] = 'MAV_MISSION_INVALID_PARAM6_Y'
enums['MAV_MISSION_RESULT'][12] = 'MAV_MISSION_INVALID_PARAM7'
enums['MAV_MISSION_RESULT'][13] = 'MAV_MISSION_INVALID_SEQUENCE'
enums['MAV_MISSION_RESULT'][14] = 'MAV_MISSION_DENIED'
enums['MAV_MISSION_RESULT'][15] = 'MAV_MISSION_OPERATION_CANCELLED'
enums['MAV_MISSION_RESULT'][16] = 'MAV_MISSION_RESULT_ENUM_END'

# MAV_STATE
enums['MAV_STATE'] = {}
enums['MAV_STATE'][0] = 'MAV_STATE_UNINIT'
enums['MAV_STATE'][1] = 'MAV_STATE_BOOT'
enums['MAV_STATE'][2] = 'MAV_STATE_CALIBRATING'
enums['MAV_STATE'][3] = 'MAV_STATE_STANDBY'
enums['MAV_STATE'][4] = 'MAV_STATE_ACTIVE'
enums['MAV_STATE'][5] = 'MAV_STATE_CRITICAL'
enums['MAV_STATE'][6] = 'MAV_STATE_EMERGENCY'
enums['MAV_STATE'][7] = 'MAV_STATE_POWEROFF'
enums['MAV_STATE'][8] = 'MAV_STATE_FLIGHT_TERMINATION'
enums['MAV_STATE'][9] = 'MAV_STATE_ENUM_END'

# Cusuom_Mode
enums['Cusuom_Mode'] = {}
enums['Cusuom_Mode'][0] = 'STABILIZE'
enums['Cusuom_Mode'][1] = 'ACRO'
enums['Cusuom_Mode'][2] = 'ALT_HOLD' 
enums['Cusuom_Mode'][3] = 'AUTO' 
enums['Cusuom_Mode'][4] = 'GUIDED' 
enums['Cusuom_Mode'][5] = 'LOITER' 
enums['Cusuom_Mode'][6] = 'RTL' 
enums['Cusuom_Mode'][7] = 'CIRCLE' 
enums['Cusuom_Mode'][8] = 'POSITION' 
enums['Cusuom_Mode'][9] = 'LAND'

# GPS_FIX_TYPE
enums['GPS_FIX_TYPE'] = {}
enums['GPS_FIX_TYPE'][0] = 'GPS_FIX_TYPE_NO_GPS'
enums['GPS_FIX_TYPE'][1] = 'GPS_FIX_TYPE_NO_FIX'
enums['GPS_FIX_TYPE'][2] = 'GPS_FIX_TYPE_2D_FIX'
enums['GPS_FIX_TYPE'][3] = 'GPS_FIX_TYPE_3D_FIX'
enums['GPS_FIX_TYPE'][4] = 'GPS_FIX_TYPE_DGPS'
enums['GPS_FIX_TYPE'][5] = 'GPS_FIX_TYPE_RTK_FLOAT'
enums['GPS_FIX_TYPE'][6] = 'GPS_FIX_TYPE_RTK_FIXED'
enums['GPS_FIX_TYPE'][7] = 'GPS_FIX_TYPE_STATIC'
enums['GPS_FIX_TYPE'][8] = 'GPS_FIX_TYPE_PPP'
enums['GPS_FIX_TYPE'][9] = 'GPS_FIX_TYPE_ENUM_END'

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

        # return "GLOBAL_POSITION_INT: time_boot_us={},lat={},lon={},alt={},relative_alt={},vx={},vy={},vz={},hdg={}".format(self.time_boot_us, self.lat, self.lon,self.alt,self.relative_alt,self.vx,self.vy,self.vz,self.hdg)

class SYS_STATUS(object):

    def __init__(self, onboard_control_sensors_present=None, onboard_control_sensors_enabled=None, onboard_control_sensors_health=None, load=None, voltage_battery=None, current_battery=None, battery_remaining=None, drop_rate_comm=None, errors_comm=None, errors_count1=None, errors_count2=None, errors_count3=None, errors_count4=None):
        self.onboard_control_sensors_present = onboard_control_sensors_present
        self.onboard_control_sensors_enabled = onboard_control_sensors_enabled
        self.onboard_control_sensors_health = onboard_control_sensors_health
        self.load = load
        self.voltage_battery = voltage_battery
        self.current_battery = current_battery
        self.battery_remaining = battery_remaining
        self.drop_rate_comm = drop_rate_comm
        self.errors_comm = errors_comm
        self.errors_count1 = errors_count1
        self.errors_count2 = errors_count2
        self.errors_count3 = errors_count3
        self.errors_count4 = errors_count4
        
    def __str__(self):
        SYS_STATUS_dict = {'voltage':self.voltage_battery, 'current':self.current_battery, 'percentage':self.battery_remaining}
        SYS_STATUS_json = json.dumps(SYS_STATUS_dict)
        return SYS_STATUS_json

        # return "SYS_STATUS: onboard_control_sensors_present={},onboard_control_sensors_enabled={},onboard_control_sensors_health={},load={},voltage_battery={},current_battery={},battery_remaining={},drop_rate_comm={},errors_comm={},errors_count1={},errors_count2={},errors_count3={},errors_count4={}".format(self.onboard_control_sensors_present, self.onboard_control_sensors_enabled, self.onboard_control_sensors_health, self.load, self.voltage_battery, self.current_battery, self.battery_remaining,self.drop_rate_comm, self.errors_comm, self.errors_count1, self.errors_count2, self.errors_count3, self.errors_count4)

class VFR_HUD(object):

    def __init__(self, airspeed=None, groundspeed=None, heading=None, throttle=None, alt=None, climb=None):
        self.airspeed = airspeed
        self.groundspeed = groundspeed
        self.heading = heading
        self.throttle = throttle
        self.alt = alt
        self.climb = climb

    def __str__(self):
        VFR_HUD_dict = {'air_speed':self.airspeed, 'gnd_speed':self.groundspeed}
        VFR_HUD_json = json.dumps(VFR_HUD_dict)
        return VFR_HUD_json

        # return "VFR_HUD: airspeed={},groundspeed={},heading={},throttle={},alt={},climb={}".format(self.airspeed, self.groundspeed, self.heading, self.throttle, self.alt, self.climb)


class ATTITUDE(object):

    def __init__(self, time_boot_ms=None, roll=None, pitch=None, yaw=None, rollspeed=None, pitchspeed=None, yawspeed=None):
        self.time_boot_ms = time_boot_ms
        self.roll = roll
        self.pitch = pitch
        self.yaw = yaw
        self.rollspeed = rollspeed
        self.pitchspeed = pitchspeed
        self.yawspeed = yawspeed
        
    def __str__(self):
        ATTITUDE_dict = {'roll':self.roll, 'pitch':self.pitch, 'yaw':self.yaw}
        ATTITUDE_json = json.dumps(ATTITUDE_dict)
        return ATTITUDE_json

        # return "ATTITUDE: time_boot_us={},roll={},pitch={},yaw={},rollspeed={},pitchspeed={},yawspeed={}".format(self.time_boot_ms, self.roll, self.pitch, self.yaw, self.rollspeed, self.pitchspeed, self.yawspeed)

class GPS_RAW_INT(object):

    def __init__(self, time_usec=None, fix_type=None, lat=None, lon=None, alt=None, eph=None, epv=None, vel=None, cog=None, satellites_visible=None):
        self.time_usec = time_usec
        self.fix_type = fix_type
        self.lat = lat
        self.lon = lon
        self.alt = alt
        self.eph = eph
        self.epv = epv
        self.vel = vel
        self.cog = cog
        self.satellites_visible = satellites_visible
        
    def __str__(self):
        GPS_RAW_INT_dict = {'fix_type':self.fix_type, 'hpop':self.eph, 'vdop':self.epv, 'cog':self.cog, 'gps_count':self.satellites_visible}
        GPS_RAW_INT_json = json.dumps(GPS_RAW_INT_dict)
        return GPS_RAW_INT_json

        # return "GPS_RAW_INT: time_usec={},fix_type={},lat={},lon={},alt={},eph={},epv={},vel={},cog={},satellites_visible={}".format(self.time_usec, self.fix_type, self.lat, self.lon, self.alt, self.eph, self.epv, self.vel, self.cog, self.satellites_visible)

class HEARTBEAT(object):

    def __init__(self, type=None, autopilot=None, base_mode=None, custom_mode=None, system_status=None, mavlink_version=None):
        self.type = type
        self.autopilot = autopilot
        self.base_mode = base_mode
        self.custom_mode = custom_mode
        self.system_status = system_status
        self.mavlink_version = mavlink_version
        
    def __str__(self):
        GPS_RAW_INT_dict = {'mav_type':'MAV_TYPE_QUADROTOR', 'mav_autopilot':'MAV_AUTOPILOT_ARDUPILOTMEGA', 'flight_mode':self.custom_mode, 'system_status':self.system_status, 'is_armed':self.base_mode}
        GPS_RAW_INT_json = json.dumps(GPS_RAW_INT_dict)
        return GPS_RAW_INT_json

        # return "HEARTBEAT: type={},autopilot={},base_mode={},custom_mode={},system_status={},mavlink_version={}".format(self.type, self.autopilot, self.base_mode, self.custom_mode, self.system_status, self.mavlink_version)

class COMMAND_ACK(object):
    def __init__(self, command=None, result=None):
        self.command_ = command
        self.result_ = result

    def __str__(self):
        COMMAND_ACK_dict = {'type':"cmd_ack", 'cmd':self.command, 'cmd_result':self.result}
        COMMAND_ACK_json = json.dumps(COMMAND_ACK_dict)
        return COMMAND_ACK_json
        # return "COMMAND_ACK: command={},result={}".format(self.command, self.result)

class STATUSTEXT(object):
    def __init__(self, severity=None, text=None):
        self.severity = severity
        self.text = text

    def __str__(self):
        # STATUSTEXT_dict = {'severity':self.severity, 'text':self.text}
        STATUSTEXT_dict = {'type':"apm_text", 'text':self.text}
        STATUSTEXT_json = json.dumps(STATUSTEXT_dict)
        return STATUSTEXT_json
        # return "STATUSTEXT: command={},text={}".format(self.severity, self.text)
            
class MISSION_ACK(object):
    def __init__(self, target_system=None, target_component=None, type=None):
        self.target_system = target_system
        self.target_component = target_component
        self.type = type

    def __str__(self):
        # MISSION_ACK_dict = {'target_system':self.target_system, 'target_component':self.target_component, 'type':self.type}
        MISSION_ACK_dict = {'type':"mission_ack", 'mission_result':self.type}
        MISSION_ACK_json = json.dumps(MISSION_ACK_dict)
        return MISSION_ACK_json
        # return "MISSION_ACK: target_system={},target_component={},type={}".format(self.target_system, self.target_component, self.type)
   
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

        # SYS_STATUS
        self._SYS_STATUS = SYS_STATUS()
        @self.on_message('SYS_STATUS')
        def listener(self, name, message):

            self._SYS_STATUS.onboard_control_sensors_present = message.onboard_control_sensors_present
            self._SYS_STATUS.onboard_control_sensors_enabled = message.onboard_control_sensors_enabled
            self._SYS_STATUS.onboard_control_sensors_health = message.onboard_control_sensors_health
            self._SYS_STATUS.load = message.load
            self._SYS_STATUS.voltage_battery = message.voltage_battery / 1000.0
            self._SYS_STATUS.current_battery = message.current_battery / 100.0
            self._SYS_STATUS.battery_remaining = message.battery_remaining
            self._SYS_STATUS.drop_rate_comm = message.drop_rate_comm
            self._SYS_STATUS.errors_comm = message.errors_comm
            self._SYS_STATUS.errors_count1 = message.errors_count1
            self._SYS_STATUS.errors_count2 = message.errors_count2
            self._SYS_STATUS.errors_count3 = message.errors_count3
            self._SYS_STATUS.errors_count4 = message.errors_count4

            self.notify_attribute_listeners('SYS_STATUS', self._SYS_STATUS)

        # VFR_HUD
        self._VFR_HUD = VFR_HUD()
        @self.on_message('VFR_HUD')
        def listener(self, name, message):

            self._VFR_HUD.airspeed = round(message.airspeed, 2)
            self._VFR_HUD.groundspeed = round(message.groundspeed, 2)
            self._VFR_HUD.heading = message.heading
            self._VFR_HUD.throttle = message.throttle
            self._VFR_HUD.alt = message.alt
            self._VFR_HUD.climb = message.climb

            self.notify_attribute_listeners('VFR_HUD', self._VFR_HUD)

        # ATTITUDE
        self._ATTITUDE = ATTITUDE()

        @self.on_message('ATTITUDE')
        def listener(self, name, message):

            self._ATTITUDE.time_boot_ms = message.time_boot_ms
            self._ATTITUDE.roll = round(message.roll * 57.29, 2)
            self._ATTITUDE.pitch = round(message.pitch * 57.29, 2)
            self._ATTITUDE.yaw = round(message.yaw * 57.29, 2)
            self._ATTITUDE.rollspeed = message.rollspeed
            self._ATTITUDE.pitchspeed = message.pitchspeed
            self._ATTITUDE.yawspeed = message.yawspeed

            self.notify_attribute_listeners('ATTITUDE', self._ATTITUDE)

        # GPS_RAW_INT:
        self._GPS_RAW_INT = GPS_RAW_INT()

        @self.on_message('GPS_RAW_INT')
        def listener(self, name, message):

            self._GPS_RAW_INT.time_usec = message.time_usec
            GPS_RAW_INT_fix_type = message.fix_type
            self._GPS_RAW_INT.fix_type = enums['GPS_FIX_TYPE'][GPS_RAW_INT_fix_type]
            self._GPS_RAW_INT.lat = message.lat
            self._GPS_RAW_INT.lon = message.lon
            self._GPS_RAW_INT.alt = message.alt
            self._GPS_RAW_INT.eph = round(message.eph / 100.0, 2)
            self._GPS_RAW_INT.epv = round(message.epv / 100.0, 2)
            self._GPS_RAW_INT.vel = message.vel
            self._GPS_RAW_INT.cog = message.cog
            self._GPS_RAW_INT.satellites_visible = message.satellites_visible

            self.notify_attribute_listeners('GPS_RAW_INT', self._GPS_RAW_INT)

        # HEARTBEAT
        self._HEARTBEAT = HEARTBEAT()

        @self.on_message('HEARTBEAT')
        def listener(self, name, message):

            def is_armed(base_mode):

                base_mode_binary = bin(int(base_mode))
                base_mode_binary = base_mode_binary[2:]
                while len(base_mode_binary) < 8:
                    base_mode_binary = '0' + base_mode_binary

                return base_mode_binary[0]

            self._HEARTBEAT.type = message.type
            self._HEARTBEAT.autopilot = message.autopilot
            self._HEARTBEAT.base_mode = is_armed(message.base_mode)
            HEARTBEAT_command = message.custom_mode
            self._HEARTBEAT.custom_mode = enums['Cusuom_Mode'][HEARTBEAT_command]
            HEARTBEAT_system_status = message.system_status
            self._HEARTBEAT.system_status = enums['MAV_STATE'][HEARTBEAT_system_status]
            self._HEARTBEAT.mavlink_version = message.mavlink_version

            self.notify_attribute_listeners('HEARTBEAT', self._HEARTBEAT)

        # COMMAND_ACK
        self._COMMAND_ACK  = COMMAND_ACK()

        @self.on_message('COMMAND_ACK')
        def listener(self, name, message):

            COMMAND_ACK_command = message.command
            self._COMMAND_ACK.command = enums['MAV_CMD'][COMMAND_ACK_command]
            COMMAND_ACK_result = message.result
            self._COMMAND_ACK.result = enums['MAV_RESULT'][COMMAND_ACK_result]

            self.notify_attribute_listeners('COMMAND_ACK', self._COMMAND_ACK)

        # STATUSTEXT
        self._STATUSTEXT  = STATUSTEXT()

        @self.on_message('STATUSTEXT')
        def listener(self, name, message):

            self._STATUSTEXT.severity = message.severity
            self._STATUSTEXT.text = message.text

            self.notify_attribute_listeners('STATUSTEXT', self._STATUSTEXT)

        # MISSION_ACK
        self._MISSION_ACK  = MISSION_ACK()

        @self.on_message('MISSION_ACK')
        def listener(self, name, message):

            self._MISSION_ACK.target_system = message.target_system
            self._MISSION_ACK.target_component = message.target_component
            MISSION_ACK_type = message.type
            self._MISSION_ACK.type = enums['MAV_MISSION_RESULT'][MISSION_ACK_type]

            self.notify_attribute_listeners('MISSION_ACK', self._MISSION_ACK)