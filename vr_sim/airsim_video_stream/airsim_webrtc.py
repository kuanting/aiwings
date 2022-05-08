import asyncio
import os
from av import VideoFrame
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaBlackhole

from aiortc.sdp import candidate_from_sdp
import json
import time
import airsim
import threading
import cv2
import numpy as np

class AirSimStreamTrack(VideoStreamTrack):
    """
    A video stream track that returns images captured from Microsoft AirSim VR world.
    """
    
    def __init__(self, airsim_client, vehicle_name=""):
        super().__init__()  # don't forget this!
        self.airsim_thread = AirSimImageThread(airsim_client)
        self.airsim_thread.vehicle_name = vehicle_name
        self.airsim_thread.start()

    async def recv(self):
        pts, time_base = await self.next_timestamp()

        img = self.airsim_thread.get_result()
        try:
            frame = VideoFrame.from_ndarray(img, format="bgr24")

        except AttributeError:
            # return black image with default size
            blk_mat = np.zeros([self.airsim_thread.img_width, self.airsim_thread.img_height, 3], np.uint8)
            frame = VideoFrame.from_ndarray(blk_mat, format="bgr24")

        frame.pts = pts
        frame.time_base = time_base

        return frame


class AirSimImageThread():
    vehicle_name = "" # 1st vehicle
    camera_id = 0
    scene_type = airsim.ImageType.Scene
    img_width = 640
    img_height = 480

    def __init__(self, airsim_client):
        self.img_rgb = np.zeros([self.img_height, self.img_width, 3], np.uint8)
        self.client = airsim_client
        
    def start(self):
        self.thread = threading.Thread(target = self.rev_airsim_frame)
        self.thread.setDaemon(True)
        self.thread.start()
        
    def rev_airsim_frame(self):
        while True:
            # Get uncompressed RGB frame from AirSim
            responses = self.client.simGetImages([airsim.ImageRequest(self.camera_id, self.scene_type, False, False)], vehicle_name=self.vehicle_name)
            
            for idx, response in enumerate(responses):

                if response.pixels_as_float:
                    print("Type %d, size %d" % (response.image_type, len(response.image_data_float)))
                    # airsim.write_pfm(os.path.normpath(filename + '.pfm'), airsim.get_pfm_array(response))
                elif response.compress: # png format
                    print("Type %d, size %d" % (response.image_type, len(response.image_data_uint8)))
                    # airsim.write_file(os.path.normpath(filename + '.png'), response.image_data_uint8)

                else: # uncompressed array
                    # get numpy array
                    img1d = np.fromstring(response.image_data_uint8, dtype=np.uint8)
                    # reshape array to 4 channel image array H x W x 3
                    self.img_rgb = img1d.reshape(response.height, response.width, 3)

    def get_result(self):
        return self.img_rgb