package com.example.aed_drone;

import android.content.SharedPreferences;
import android.os.Handler;
import android.util.Log;
import android.widget.Spinner;

import java.io.EOFException;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

import io.dronefleet.mavlink.MavlinkConnection;
import io.dronefleet.mavlink.MavlinkMessage;
import io.dronefleet.mavlink.common.CommandLong;
import io.dronefleet.mavlink.common.MissionItemInt;

public class MAVLinkConnection {

    static MavlinkConnection connection;
    MavlinkMessage message;
    Socket socket;
    Handler mHandler;

    String server_address = "192.168.1.100";
    int server_port = 5762;
    Drone_Message drone_message = new Drone_Message();
    boolean isAskingFeedback = false;

    public MAVLinkConnection(Handler mHandler) {
        this.mHandler = mHandler;
    }

    public void Create_Connection(Spinner connect_type) {
        new Thread(() -> {
            int connect_num = connect_type.getSelectedItemPosition();
            if (connection == null) {
                try {
                    // TCP connection
                    if(connect_num == 0) {
                        socket = new Socket(server_address, server_port);
                        connection = MavlinkConnection.create(socket.getInputStream(), socket.getOutputStream());
                    }
                    // USB connection
                    else{
                        connection = MavlinkConnection.create(UsbService.pixhawk_serialInputStream, UsbService.pixhawk_serialOutputStream);
                    }
                    mHandler.obtainMessage(100, "is Connecting...").sendToTarget();
                    // When receive messages
                    while ((message = connection.next()) != null) {

                        // If receive data, push them to Drone_Message.java
                        drone_message.Message_classify(message);
                        mHandler.obtainMessage(100, "Connected...").sendToTarget();

                        // Ask Drone Feedback in first connection
                        if(!isAskingFeedback){
                            Drone_Command.STATUS();
                            isAskingFeedback = true;
                        }
                    }
                } catch (EOFException eof) {
                    Release_Connection();
                    Log.i("MAVLinkConnection", "Connection Failed (SITL crush)");
                } catch (UnknownHostException e) {
                    Release_Connection();
                    Log.i("MAVLinkConnection", "Connection Failed");
                } catch (IOException e) {
                    Release_Connection();
                    Log.i("MAVLinkConnection", "Connection Failed (No WIFI or APP crush)");
                }
            }
        }).start();
    }

    public static void Send(CommandLong commandLong) {
        new Thread(() -> {
            if(connection != null) {
                try {
                    connection.send1(255, 0, commandLong);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    public static void Send(MissionItemInt missionItemInt) {
        new Thread(() -> {
            if(connection != null) {
                try {
                    connection.send1(255, 0, missionItemInt);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    public void Release_Connection() {
        try {
            if (socket != null) {
                if (socket.getOutputStream() != null) {
                    socket.getOutputStream().close();
                }
                socket.close();
            }
            connection = null;
            mHandler.obtainMessage(100, "Disconnected...").sendToTarget();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void loadSettings(SharedPreferences prefs) {
        server_address = prefs.getString("sitl_address", "192.168.1.100");
        String port = prefs.getString("sitl_port", "5762");
        server_port = Integer.valueOf(port);
    }
}
