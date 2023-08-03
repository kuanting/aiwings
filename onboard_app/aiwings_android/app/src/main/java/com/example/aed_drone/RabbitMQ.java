package com.example.aed_drone;

import android.content.SharedPreferences;
import android.os.Handler;
import android.util.Log;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Consumer;
import com.rabbitmq.client.DefaultConsumer;
import com.rabbitmq.client.Envelope;

import java.io.IOException;

import java.util.concurrent.TimeoutException;

import org.json.JSONException;
import org.json.JSONObject;
import org.webrtc.IceCandidate;
import org.webrtc.SessionDescription;

import androidx.preference.PreferenceManager;

import static java.lang.Thread.sleep;

public class RabbitMQ {

    static Channel channel;
    static String EXCHANGE_NAME = "drone";
    String drone_ID;
    static String routingKey_drone;
    String bindingKey_drone;
    String routingKey_WebRTC;
    String bindingKey_WebRTC;
    String[] bindingKeys;

    String broker_address = "aiotlab-drone-cloud.ga";
    String broker_username = "guest";
    String broker_password = "guest";
    int broker_port = 5672;

    private Callback callback;
    private static Handler mHandler = MainActivity.mHandler;

    boolean isConnected = false;

    public void setCallback(Callback callback) {
        this.callback = callback;
    }

    public RabbitMQ(String drone_ID) {
        this.drone_ID = drone_ID;
        this.routingKey_drone = drone_ID + ".phone.drone";
        this.bindingKey_drone = drone_ID + ".web.drone";
        this.routingKey_WebRTC = drone_ID + ".phone.webrtc";
        this.bindingKey_WebRTC = drone_ID + ".web.webrtc";
        this.bindingKeys = new String[] {
                bindingKey_drone,
                bindingKey_WebRTC
        };
    }

    public void loadSettings(SharedPreferences prefs) {
        broker_address = prefs.getString("broker_address", "aiotlab-drone-cloud.ga");
        String port = prefs.getString("broker_port", "5672");
        broker_port = Integer.valueOf(port);
        broker_username = prefs.getString("broker_username", "guest");
        broker_password = prefs.getString("broker_password", "guest");
    }

    public interface Callback {
        void onCreateRoom();
        void onPeerJoined();
        void onSelfJoined();
        void onPeerLeave(String msg);
        void onOfferReceived(JSONObject data);
        void onAnswerReceived(JSONObject data);
        void onIceCandidateReceived(JSONObject data);
    }

    public void connect() {
        new Thread(() -> {
            if(!isConnected) {
                ConnectionFactory factory = new ConnectionFactory();

                factory.setHost(broker_address);
                factory.setPort(broker_port);
                factory.setUsername(broker_username);
                factory.setPassword(broker_password);
                factory.setAutomaticRecoveryEnabled(true);
                factory.setTopologyRecoveryEnabled(false);
                factory.setNetworkRecoveryInterval(5);

                try {
                    Connection connection = factory.newConnection();
                    channel = connection.createChannel();
                    channel.confirmSelect();
                    channel.exchangeDeclare(EXCHANGE_NAME, "topic");

                    Consume();
                    RabbitMQ_PUBLISH_DRONE_MESSAGE();
                    sleep(5000);
                    ReConsume();

                } catch (IOException e) {
                    e.printStackTrace();
                    Log.i("RabbitMQ", "IOException (No Networks)");
                } catch (TimeoutException e) {
                    e.printStackTrace();
                    Log.i("RabbitMQ", "TimeoutException");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    Log.i("RabbitMQ", "InterruptedException");
                }
            }
        }).start();
    }

    public void Consume() {
        new Thread(() -> {
            try {
                if (channel != null && channel.isOpen()) {
                    String queueName = drone_ID + "'s  Android application";
                    AMQP.Queue.DeclareOk q = channel.queueDeclare(queueName, false, false, true, null);
                    for (String bindingKey : bindingKeys) {
                        channel.queueBind(q.getQueue(), EXCHANGE_NAME, bindingKey);
                    }
                    Consumer consumer = new DefaultConsumer(channel) {
                        @Override
                        public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                            super.handleDelivery(consumerTag, envelope, properties, body);

                            String message = new String(body);
                            if(envelope.getRoutingKey().equals(bindingKey_drone)){
                                Analyze_Web_Command.Analyze_JSON(message);
                            }
                            else if(envelope.getRoutingKey().equals(bindingKey_WebRTC)){
                                Analyze_WebRTC_type(message);
                            }
                        }
                    };
                    channel.basicConsume(q.getQueue(), true, consumer);
                    isConnected = true;
                    mHandler.obtainMessage(101, "Connected...").sendToTarget();
                    Log.i("RabbitMQ", "Consume Successfully");
                } else {
                    isConnected = false;
                    Log.i("RabbitMQ", "channel is null or isn't open");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    public void ReConsume() {
        new Thread(() -> {
            while(true){
                try {
                    if(channel.isOpen()){
                        Log.i("RabbitMQ", "[V] channel.isOpen");
                    }
                    else {
                        isConnected = false;
                        mHandler.obtainMessage(101, "Disconnected...").sendToTarget();
                        Log.i("RabbitMQ", "[X] channel.isn't Open");
                    }
                    if(!isConnected){
                        Consume();
                    }
                    sleep(10000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    public static void RabbitMQ_PUBLISH_DRONE_MESSAGE() {
        new Thread(() -> {
            while (channel != null) {
                if (channel.isOpen()) {
                    try {

                        JSONObject json = new JSONObject();
                        JSONObject Drone_message_json = Drone_Message.PacketToJson();
                        json.put("type", "message");
                        json.put("drone_info", Drone_message_json);
                        channel.basicPublish(EXCHANGE_NAME, routingKey_drone, null, json.toString().getBytes());

                        sleep(1000);
                    } catch (IOException | InterruptedException | JSONException e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();
    }

    public static void RabbitMQ_PUBLISH_CMD_ACK(String cmd_ack) {
        new Thread(() -> {
            if (channel != null) {
                if (channel.isOpen()) {
                    try {
                        channel.basicPublish(EXCHANGE_NAME, routingKey_drone, null, cmd_ack.getBytes());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();
    }

    public static void RabbitMQ_PUBLISH_MISSION_ACK(String mission_ack) {
        new Thread(() -> {
            if (channel != null) {
                if (channel.isOpen()) {
                    try {
                        channel.basicPublish(EXCHANGE_NAME, routingKey_drone, null, mission_ack.getBytes());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();
    }

    public static void RabbitMQ_PUBLISH_APM_TEXT(String apm_text) {
        new Thread(() -> {
            if (channel != null) {
                if (channel.isOpen()) {
                    try {
                        channel.basicPublish(EXCHANGE_NAME, routingKey_drone, null, apm_text.getBytes());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();
    }

    public void sendSessionDescription_offer(SessionDescription sdp) {
        JSONObject json = new JSONObject();
        JSONObject sdp_payload = new JSONObject();
        try {
            sdp_payload.put("type", sdp.type.canonicalForm());
            sdp_payload.put("sdp", sdp.description);

            json.put("type", "offer");
            json.put("payload", sdp_payload);

            channel.basicPublish(EXCHANGE_NAME, routingKey_WebRTC, null, json.toString().getBytes());
            Log.i("sendSessionDescription", String.valueOf(json));
        } catch (IOException | JSONException e) {
            e.printStackTrace();
        }
    }

    public void sendSessionDescription_answer(SessionDescription sdp) {
        JSONObject json = new JSONObject();
        JSONObject sdp_payload = new JSONObject();
        try {
            sdp_payload.put("type", sdp.type.canonicalForm());
            sdp_payload.put("sdp", sdp.description);

            json.put("type", "answer");
            json.put("payload", sdp_payload);

            channel.basicPublish(EXCHANGE_NAME, routingKey_WebRTC, null, json.toString().getBytes());
            Log.i("sendSessionDescription", String.valueOf(json));
        } catch (IOException | JSONException e) {
            e.printStackTrace();
        }
    }

    public void sendIceCandidate(IceCandidate iceCandidate) {
        JSONObject json = new JSONObject();
        JSONObject candidate_payload = new JSONObject();
        try {
            candidate_payload.put("sdpMLineIndex", iceCandidate.sdpMLineIndex);
            candidate_payload.put("sdpMid", iceCandidate.sdpMid);
            candidate_payload.put("candidate", iceCandidate.sdp);

            json.put("type", "candidate");
            json.put("payload", candidate_payload);

            channel.basicPublish(EXCHANGE_NAME, routingKey_WebRTC, null, json.toString().getBytes());
            Log.i("sendIceCandidate", json.toString());
        } catch (IOException | JSONException e) {
            e.printStackTrace();
        }
    }

    public void Analyze_WebRTC_type(String WebRTC_msg) {
        try {
            JSONObject json = new JSONObject(WebRTC_msg);
            Object jsonOb_type = json.get("type");
            String WebRTC_type = String.valueOf(jsonOb_type);

            Object jsonOb_payload = json.get("payload");
            JSONObject data = (JSONObject) jsonOb_payload;

            switch (WebRTC_type) {
                case "answer":
                    String type_answer = data.optString("type");
                    if ("answer".equals(type_answer)) {
                        callback.onAnswerReceived(data);
                        Log.i("RabbitMQ", "answer: " + data.toString());
                    }
                    break;
                case "offer":
                    String type_offer = data.optString("type");
                    if ("offer".equals(type_offer)) {
                        callback.onOfferReceived(data);
                        Log.i("RabbitMQ", "offer: " + data.toString());
                    }
                    break;
                case "candidate":
                    callback.onIceCandidateReceived(data);
                    Log.i("RabbitMQ", "candidate: " + data.toString());
                    break;
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
}

