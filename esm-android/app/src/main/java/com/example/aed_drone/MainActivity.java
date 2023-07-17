package com.example.aed_drone;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.ActivityCompat;
import androidx.preference.PreferenceManager;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;

import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.media.AudioManager;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;

import android.util.Log;

import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;

import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;
import org.webrtc.AudioSource;
import org.webrtc.AudioTrack;
import org.webrtc.Camera1Enumerator;
import org.webrtc.DefaultVideoDecoderFactory;
import org.webrtc.DefaultVideoEncoderFactory;
import org.webrtc.EglBase;
import org.webrtc.IceCandidate;
import org.webrtc.MediaConstraints;
import org.webrtc.MediaStream;
import org.webrtc.PeerConnection;
import org.webrtc.PeerConnectionFactory;
import org.webrtc.SessionDescription;
import org.webrtc.SurfaceTextureHelper;
import org.webrtc.SurfaceViewRenderer;
import org.webrtc.VideoCapturer;
import org.webrtc.VideoSource;
import org.webrtc.VideoTrack;

import java.lang.ref.WeakReference;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class MainActivity extends AppCompatActivity implements RabbitMQ.Callback{

    // USB Connection
    UsbService usbService;
    // Device ID
    static String device_ID;
    // Handler
    static MyHandler mHandler;
    // Spinner
    Spinner Spinner_connect_type;
    // Upload TextView
    TextView display_UUID;
    TextView display_PIXHAWK;
    TextView display_RabbitMQ;
    TextView display1;
    TextView display2;
    // WebRTC
    PeerConnectionFactory peerConnectionFactory;
    PeerConnection peerConnection;
    SurfaceViewRenderer localView;
    SurfaceViewRenderer remoteView;
    MediaStream mediaStream;
    // RabbitMQ
    RabbitMQ RabbitMQ;
    // MAVLinkConnection
    MAVLinkConnection MAVLinkConnection;
    // isUsingUSBCamera
    boolean isUsingUSBCamera = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        // Keep screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // Get Permission
        getPermission();
        // Handle USB message
        mHandler = new MyHandler(this);
        // Spinner variable
        Spinner_connect_type = findViewById(R.id.spinner);
        // TextView variable
        display_UUID = findViewById(R.id.textView_UUID);
        display_PIXHAWK = findViewById(R.id.textView_PIXHAWK);
        display_RabbitMQ = findViewById(R.id.textView_RabbitMQ);
        display1 = findViewById(R.id.textView1);
        display2 = findViewById(R.id.textView2);
        // Pass "Context" to Phone_Message.java
        device_ID = Phone_Message.Get_Android_ID(this.getApplicationContext());
        // Display "Device UUID" on screen
        display_UUID.setText(device_ID);
        // MAVLinkConnection
        MAVLinkConnection = new MAVLinkConnection(mHandler);
        // RabbitMQ
        RabbitMQ = new RabbitMQ(device_ID);
        RabbitMQ.setCallback(this);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return super.onCreateOptionsMenu(menu);
    }

    // getPermission
    public void getPermission(){
        ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.RECORD_AUDIO,
                        Manifest.permission.CAMERA,
                        Manifest.permission.READ_EXTERNAL_STORAGE,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE},1);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        boolean isAudioGranted = false;
        // permissions[0] = android.permission.RECORD_AUDIO, permissions[1] = android.permission.CAMERA
        if (!isUsingUSBCamera) {
            if (requestCode == 1) {
                // Audio granted
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    isAudioGranted = true;
                }
                // Camera granted
                if (grantResults[1] == PackageManager.PERMISSION_GRANTED) {
                    CreateWebRTC(isAudioGranted);
                }
            }
        }
        else {
            CreateWebRTC(false);
        }
    }

    // Drone Control
    public void connect_all(View view) {
        Pixhawk_connect(view);
        RabbitMQ_connect(view);
        WebRTC_connect(view);
    }

    public void Pixhawk_connect(View view) {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
        MAVLinkConnection.loadSettings(prefs);
        MAVLinkConnection.Create_Connection(Spinner_connect_type);
    }

    // RabbitMQ Connection
    public void RabbitMQ_connect(View view) {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
        RabbitMQ.loadSettings(prefs);
        RabbitMQ.connect();
    }

    // WebRTC Connection
    public void WebRTC_connect(View view) {
        onSelfJoined();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Start listening notifications from UsbService
        setFilters();
        // Start UsbService(if it was not started before) and Bind
        startService(UsbService.class, usbConnection, null);
    }
    @Override
    public void onPause() {
        super.onPause();
        unregisterReceiver(mUsbReceiver);
        unbindService(usbConnection);
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        MAVLinkConnection.Release_Connection();
    }

    // ****** UsbService ******
    private void startService(Class<?> service, ServiceConnection serviceConnection, Bundle extras) {
        if (!UsbService.SERVICE_CONNECTED) {
            Intent startService = new Intent(this, service);
            if (extras != null && !extras.isEmpty()) {
                Set<String> keys = extras.keySet();
                for (String key : keys) {
                    String extra = extras.getString(key);
                    startService.putExtra(key, extra);
                }
            }
            startService(startService);
        }
        Intent bindingIntent = new Intent(this, service);
        bindService(bindingIntent, serviceConnection, Context.BIND_AUTO_CREATE);
    }

    private void setFilters() {
        IntentFilter filter = new IntentFilter();
        filter.addAction(UsbService.ACTION_USB_PERMISSION_GRANTED);
        filter.addAction(UsbService.ACTION_NO_USB);
        filter.addAction(UsbService.ACTION_USB_DISCONNECTED);
        filter.addAction(UsbService.ACTION_USB_NOT_SUPPORTED);
        filter.addAction(UsbService.ACTION_USB_PERMISSION_NOT_GRANTED);
        registerReceiver(mUsbReceiver, filter);
    }

    private final ServiceConnection usbConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName arg0, IBinder arg1) {
            usbService = ((UsbService.UsbBinder) arg1).getService();
            usbService.setHandler(mHandler);
        }
        @Override
        public void onServiceDisconnected(ComponentName arg0) {
            usbService = null;
        }
    };

    // Notifications from UsbService will be received here.
    private final BroadcastReceiver mUsbReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            switch (intent.getAction()) {
                case UsbService.ACTION_USB_PERMISSION_GRANTED: // USB PERMISSION GRANTED
                    Toast.makeText(context, "USB Ready", Toast.LENGTH_SHORT).show();
                    break;
                case UsbService.ACTION_USB_PERMISSION_NOT_GRANTED: // USB PERMISSION NOT GRANTED
                    Toast.makeText(context, "USB Permission not granted", Toast.LENGTH_SHORT).show();
                    break;
                case UsbService.ACTION_NO_USB: // NO USB CONNECTED
                    Toast.makeText(context, "No USB connected", Toast.LENGTH_SHORT).show();
                    break;
                case UsbService.ACTION_USB_DISCONNECTED: // USB DISCONNECTED
                    Toast.makeText(context, "USB disconnected", Toast.LENGTH_SHORT).show();
                    break;
                case UsbService.ACTION_USB_NOT_SUPPORTED: // USB NOT SUPPORTED
                    Toast.makeText(context, "USB device not supported", Toast.LENGTH_SHORT).show();
                    break;
            }
        }
    };

    // This handler will handle TextView UI
    private static class MyHandler extends Handler {
        private final WeakReference<MainActivity> mActivity;
        public MyHandler(MainActivity activity) {
            mActivity = new WeakReference<>(activity);
        }
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {

                // USB or TCP connection status (refer to MAVLinkConnection.java)
                case 100:
                    String connection_PIXHAWK = (String) msg.obj;
                    mActivity.get().display_PIXHAWK.setText(connection_PIXHAWK);
                    break;
                // RabbitMQ connection status (refer to RabbitMQ.java)
                case 101:
                    String connection_RabbitMQ = (String) msg.obj;
                    mActivity.get().display_RabbitMQ.setText(connection_RabbitMQ);
                    break;
                // WEb_CMD (refer to Analyze_Web_Command.java)
                case 109:
                    String web_cmd = (String) msg.obj;
                    mActivity.get().display1.append("\n" + web_cmd);
                    break;
                // CMD_ACK (refer to Drone_Message.java)
                case 110:
                    String cmd_ack = (String) msg.obj;
                    mActivity.get().display2.append("\n" + cmd_ack);
                    break;
                // Sensor Data (refer to UsbService.java)
                case UsbService.SYNC_READ:
                    String sensor_data = (String) msg.obj;
                    break;
            }
        }
    }

    // ****** WebRTC ******
    public void CreateWebRTC(boolean isAudioGranted) {
        // *** WebRTC ***
        EglBase.Context eglBaseContext = EglBase.create().getEglBaseContext();
        // Create PeerConnectionFactory
        PeerConnectionFactory.initialize(PeerConnectionFactory.InitializationOptions
                .builder(this)
                .createInitializationOptions());
        PeerConnectionFactory.Options options = new PeerConnectionFactory.Options();
        DefaultVideoEncoderFactory defaultVideoEncoderFactory =
                new DefaultVideoEncoderFactory(eglBaseContext, true, true);
        DefaultVideoDecoderFactory defaultVideoDecoderFactory =
                new DefaultVideoDecoderFactory(eglBaseContext);
        peerConnectionFactory = PeerConnectionFactory.builder()
                .setOptions(options)
                .setVideoEncoderFactory(defaultVideoEncoderFactory)
                .setVideoDecoderFactory(defaultVideoDecoderFactory)
                .createPeerConnectionFactory();

        SurfaceTextureHelper surfaceTextureHelper = SurfaceTextureHelper.create("CaptureThread", eglBaseContext);

        localView = findViewById(R.id.localView);
        localView.setMirror(true);
        localView.init(eglBaseContext, null);

        VideoSource videoSource;
        if (isUsingUSBCamera){
            // create USBCapturer (USB Camera)
            USBCapturer usbCapturer = new USBCapturer(getApplicationContext(), localView);
            videoSource = peerConnectionFactory.createVideoSource(true);
            usbCapturer.initialize(surfaceTextureHelper, getApplicationContext(), videoSource.getCapturerObserver());
        }
        else {
            // create VideoCapturer (Built-in Camera) / createCameraCapturer(true) <true for Front Camera, false for Rear Camera>
            VideoCapturer videoCapturer = createCameraCapturer(false);
            videoSource = peerConnectionFactory.createVideoSource(videoCapturer.isScreencast());
            videoCapturer.initialize(surfaceTextureHelper, getApplicationContext(), videoSource.getCapturerObserver());
            videoCapturer.startCapture(1080, 1920, 60);
        }

        // Create VideoTrack
        VideoTrack videoTrack = peerConnectionFactory.createVideoTrack("100", videoSource);
        // Display in localView
        videoTrack.addSink(localView);

        remoteView = findViewById(R.id.remoteView);
        remoteView.setMirror(false);
        remoteView.init(eglBaseContext, null);

        mediaStream = peerConnectionFactory.createLocalMediaStream("mediaStream");
        mediaStream.addTrack(videoTrack);

        if (isAudioGranted){
            // Create AudioTrack
            AudioSource audioSource = peerConnectionFactory.createAudioSource(new MediaConstraints());
            AudioTrack audioTrack = peerConnectionFactory.createAudioTrack("101", audioSource);

            AudioManager audioManager = (AudioManager)getSystemService(Context.AUDIO_SERVICE);
            audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
            audioManager.setSpeakerphoneOn(true);

            mediaStream.addTrack(audioTrack);
        }
    }

    private void call() {
        if (peerConnection != null) {
            peerConnection.close();
        }
        List<PeerConnection.IceServer> iceServers = new ArrayList<>();
        iceServers.add(PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer());
        peerConnection = peerConnectionFactory.createPeerConnection(iceServers, new PeerConnectionAdapter("localconnection") {
            @Override
            public void onIceCandidate(IceCandidate iceCandidate) {
                super.onIceCandidate(iceCandidate);
                RabbitMQ.sendIceCandidate(iceCandidate);
            }

            @Override
            public void onAddStream(MediaStream mediaStream) {
                super.onAddStream(mediaStream);
                VideoTrack remoteVideoTrack = mediaStream.videoTracks.get(0);
                runOnUiThread(() -> {
                    remoteVideoTrack.addSink(remoteView);
                });
            }
        });
        peerConnection.addStream(mediaStream);
    }

    private VideoCapturer createCameraCapturer(boolean isFront) {
        Camera1Enumerator enumerator = new Camera1Enumerator(false);
        final String[] deviceNames = enumerator.getDeviceNames();

        // First, try to find front facing camera
        for (String deviceName : deviceNames) {
            if (isFront ? enumerator.isFrontFacing(deviceName) : enumerator.isBackFacing(deviceName)) {
                VideoCapturer videoCapturer = enumerator.createCapturer(deviceName, null);

                if (videoCapturer != null) {
                    return videoCapturer;
                }
            }
        }
        return null;
    }

    @Override
    public void onCreateRoom() {
    }

    @Override
    public void onPeerJoined() {
    }

    @Override
    public void onSelfJoined() {
        if (peerConnectionFactory != null) {
            call();
            peerConnection.createOffer(new SdpAdapter("local offer sdp") {
                @Override
                public void onCreateSuccess(SessionDescription sessionDescription) {
                    super.onCreateSuccess(sessionDescription);
                    peerConnection.setLocalDescription(new SdpAdapter("local set local"), sessionDescription);
                    RabbitMQ.sendSessionDescription_offer(sessionDescription);
                }
            }, new MediaConstraints());
        }
    }

    @Override
    public void onPeerLeave(String msg) {
    }

    @Override
    public void onAnswerReceived(JSONObject data) {
        if (peerConnectionFactory != null) {
            peerConnection.setRemoteDescription(new SdpAdapter("localSetRemote"),
                    new SessionDescription(SessionDescription.Type.ANSWER, data.optString("sdp")));
        }
    }

    @Override
    public void onOfferReceived(JSONObject data) {
        if (peerConnectionFactory != null) {
            call();
            runOnUiThread(() -> {
                peerConnection.setRemoteDescription(new SdpAdapter("localSetRemote"),
                        new SessionDescription(SessionDescription.Type.OFFER, data.optString("sdp")));
                peerConnection.createAnswer(new SdpAdapter("localAnswerSdp") {
                    @Override
                    public void onCreateSuccess(SessionDescription sdp) {
                        super.onCreateSuccess(sdp);
                        peerConnection.setLocalDescription(new SdpAdapter("localSetLocal"), sdp);
                        RabbitMQ.sendSessionDescription_answer(sdp);
                    }
                }, new MediaConstraints());
            });
        }
    }

    @Override
    public void onIceCandidateReceived(JSONObject data) {
        if (peerConnectionFactory != null) {
            peerConnection.addIceCandidate(new IceCandidate(
                    data.optString("id"),
                    data.optInt("label"),
                    data.optString("candidate")
            ));
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.action_settings:
                Intent intent = new Intent(this, SettingsActivity.class);
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}