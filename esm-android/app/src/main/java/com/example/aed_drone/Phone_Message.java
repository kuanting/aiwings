package com.example.aed_drone;

import android.content.Context;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.util.Log;


public class Phone_Message {

    static String device_id = null;

    public static String Get_Android_ID(Context context){
        try {
            device_id = Settings.System.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
            Log.i("Phone_Message", "deviceId " + device_id);
        }catch (SecurityException e) {
            device_id = null;
            Log.i("Phone_Message", "Get Android ID Failed");
        }
        return device_id;
    }

    public static boolean hasSimCard(TelephonyManager telephonyManager) {
        int simState = telephonyManager.getSimState();
        boolean result = true;
        switch (simState) {
            case TelephonyManager.SIM_STATE_ABSENT:
            case TelephonyManager.SIM_STATE_UNKNOWN:
                result = false;
                break;
        }
        Log.i("Phone_Message", result ? "hasSimCard" : "NoSimCard");
        return result;
    }

    public static boolean PING(){
        try {
            Runtime runtime = Runtime.getRuntime();
            Process  mIpAddrProcess = runtime.exec("/system/bin/ping -c 1 8.8.8.8");
            int mExitValue = mIpAddrProcess.waitFor();
            return mExitValue == 0;
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return false;
    }
}
