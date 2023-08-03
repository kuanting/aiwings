package com.example.aed_drone;

import android.content.Context;
import android.content.res.AssetManager;

import android.graphics.Bitmap;
import android.hardware.usb.UsbDevice;
import android.os.Handler;

import com.serenegiant.usb.IFrameCallback;
import com.serenegiant.usb.USBMonitor;
import com.serenegiant.usb.UVCCamera;

import org.webrtc.CapturerObserver;
import org.webrtc.NV21Buffer;
import org.webrtc.SurfaceTextureHelper;
import org.webrtc.SurfaceViewRenderer;
import org.webrtc.VideoCapturer;
import org.webrtc.VideoFrame;

import java.nio.ByteBuffer;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class USBCapturer implements VideoCapturer, USBMonitor.OnDeviceConnectListener, IFrameCallback{
    private Context context;
    private USBMonitor monitor;
    private SurfaceViewRenderer svVideoRender;
    private SurfaceTextureHelper surfaceTextureHelper;
    private CapturerObserver capturerObserver;
    private Executor executor = Executors.newSingleThreadExecutor();

    private Handler mHandler = MainActivity.mHandler;

    boolean rendering = false;

    public USBCapturer(Context context, SurfaceViewRenderer svVideoRender) {
        this.context = context;
        this.svVideoRender = svVideoRender;
        executor.execute(new Runnable() {
            @Override
            public void run() {
                monitor = new USBMonitor(context, USBCapturer.this);
                monitor.register();
            }
        });
    }
    // Video Capturer
    @Override
    public void initialize(SurfaceTextureHelper surfaceTextureHelper, Context context, CapturerObserver capturerObserver) {
        this.surfaceTextureHelper = surfaceTextureHelper;
        this.capturerObserver = capturerObserver;
    }
    @Override
    public void startCapture(int i, int i1, int i2) {

    }
    @Override
    public void stopCapture() throws InterruptedException {
        if(camera != null){
            camera.stopPreview();
            camera.close();
            camera.destroy();
        }
    }
    @Override
    public void changeCaptureFormat(int i, int i1, int i2) {

    }
    @Override
    public void dispose() {
        monitor.unregister();
        monitor.destroy();

    }
    @Override
    public boolean isScreencast() {
        return false;
    }

    //USBMonitor.OnDeviceConnectListener
    @Override
    public void onAttach(UsbDevice device) {
        int vendor_ID = device.getVendorId();
        // Only request permission for USBCamera
        if(vendor_ID == 0){
            monitor.requestPermission(device);
        }
    }
    @Override
    public void onDettach(UsbDevice device) {
    }

    UVCCamera camera;
    @Override
    public void onConnect(UsbDevice device, USBMonitor.UsbControlBlock ctrlBlock, boolean createNew) {
        executor.execute(new Runnable() {
            @Override
            public void run() {
                camera = new UVCCamera();
                camera.open(ctrlBlock);
                try {
                    camera.setPreviewSize(UVCCamera.DEFAULT_PREVIEW_WIDTH, UVCCamera.DEFAULT_PREVIEW_HEIGHT, UVCCamera.FRAME_FORMAT_MJPEG);
//                    camera.setPreviewSize(Frame_WIDTH, Frame_HEIGHT, UVCCamera.FRAME_FORMAT_MJPEG);
                } catch (final IllegalArgumentException e) {
                    try {
                        camera.setPreviewSize(UVCCamera.DEFAULT_PREVIEW_WIDTH, UVCCamera.DEFAULT_PREVIEW_HEIGHT, UVCCamera.DEFAULT_PREVIEW_MODE);
//                        camera.setPreviewSize(Frame_WIDTH, Frame_HEIGHT, UVCCamera.DEFAULT_PREVIEW_MODE);
                    } catch (final IllegalArgumentException e1) {
                        camera.destroy();
                        camera = null;
                    }
                }
                camera.setPreviewDisplay(svVideoRender.getHolder());
                camera.setFrameCallback(USBCapturer.this, UVCCamera.PIXEL_FORMAT_RGBX);
                camera.startPreview();
            }
        });
    }
    @Override
    public void onDisconnect(UsbDevice device, USBMonitor.UsbControlBlock ctrlBlock) {
    }
    @Override
    public void onCancel(UsbDevice device) {
    }

    @Override
    public void onFrame(ByteBuffer frame) {
        executor.execute(new Runnable() {
            @Override
            public void run() {
                byte[] imageArray = new byte[frame.remaining()];
                frame.get(imageArray);

                Bitmap bitmap = Bitmap.createBitmap(UVCCamera.DEFAULT_PREVIEW_WIDTH, UVCCamera.DEFAULT_PREVIEW_HEIGHT, Bitmap.Config.ARGB_8888);
                bitmap.copyPixelsFromBuffer(ByteBuffer.wrap(imageArray));

                if(!rendering){
                    request_render(bitmap);
                }
            }
        });
    }
    public void request_render(Bitmap bitmap) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                if(bitmap != null) {
                    rendering = true;
                    long timestampNS = System.nanoTime();
                    byte[] byteArray = bitmapToNv21(bitmap, UVCCamera.DEFAULT_PREVIEW_WIDTH, UVCCamera.DEFAULT_PREVIEW_HEIGHT);
                    NV21Buffer buffer = new NV21Buffer(byteArray, UVCCamera.DEFAULT_PREVIEW_WIDTH, UVCCamera.DEFAULT_PREVIEW_HEIGHT, null);
                    VideoFrame videoFrame = new VideoFrame(buffer, 0, timestampNS);
                    capturerObserver.onFrameCaptured(videoFrame);
                    rendering = false;
                }
            }
        }).start();
    }

    public static byte[] bitmapToNv21(Bitmap src, int width, int height) {
        if (src != null && src.getWidth() >= width && src.getHeight() >= height) {
            int[] argb = new int[width * height];
            src.getPixels(argb, 0, width, 0, 0, width, height);
            return argbToNv21(argb, width, height);
        } else {
            return null;
        }
    }
    private static byte[] argbToNv21(int[] argb, int width, int height) {
        int frameSize = width * height;
        int yIndex = 0;
        int uvIndex = frameSize;
        int index = 0;
        byte[] nv21 = new byte[width * height * 3 / 2];
        for (int j = 0; j < height; ++j) {
            for (int i = 0; i < width; ++i) {

                int R = (argb[index] & 0xFF0000) >> 16;
                int G = (argb[index] & 0x00FF00) >> 8;
                int B = argb[index] & 0x0000FF;

                int Y = (66 * R + 129 * G + 25 * B + 128 >> 8) + 16;
                int U = (-38 * R - 74 * G + 112 * B + 128 >> 8) + 128;
                int V = (112 * R - 94 * G - 18 * B + 128 >> 8) + 128;

                nv21[yIndex++] = (byte) (Y < 0 ? 0 : (Y > 255 ? 255 : Y));
                if (j % 2 == 0 && index % 2 == 0 && uvIndex < nv21.length - 2) {
                    nv21[uvIndex++] = (byte) (V < 0 ? 0 : (V > 255 ? 255 : V));
                    nv21[uvIndex++] = (byte) (U < 0 ? 0 : (U > 255 ? 255 : U));
                }

                index ++;
            }
        }
        return nv21;
    }
}
