import airsim
import numpy as np
import os
import cv2
import threading

client = airsim.CarClient()
client.confirmConnection()
# client.enableApiControl(True)
car_controls = airsim.CarControls()

ROOT = os.path.dirname(__file__)
PHOTO_PATH = os.path.join(ROOT, "photo.jpg")


class AirSim_Frame_Thread:
    def __init__(self):
        self.img_rgb = cv2.imread(PHOTO_PATH, cv2.IMREAD_COLOR)
        t = threading.Thread(target=self.rev_airsim_frame)
        t.setDaemon(True)
        t.start()

    def rev_airsim_frame(self):
        while True:
            responses = client.simGetImages(
                [airsim.ImageRequest("0", airsim.ImageType.Scene, False, False)]
            )

            for idx, response in enumerate(responses):
                filename = 'c:/temp/car_multi_py' + str(idx)

                if response.pixels_as_float:
                    print("1")
                    print(
                        "Type %d, size %d"
                        % (response.image_type, len(response.image_data_float))
                    )
                    # airsim.write_pfm(os.path.normpath(filename + '.pfm'), airsim.get_pfm_array(response))
                elif response.compress:  # png format
                    print("2")
                    print(
                        "Type %d, size %d"
                        % (response.image_type, len(response.image_data_uint8))
                    )
                    # airsim.write_file(os.path.normpath(filename + '.png'), response.image_data_uint8)

                else:  # uncompressed array
                    # get numpy array
                    img1d = np.fromstring(response.image_data_uint8, dtype=np.uint8)
                    # reshape array to 4 channel image array H x W x 3
                    self.img_rgb = img1d.reshape(response.height, response.width, 3)

                    cv2.imwrite(os.path.normpath(filename + '.png'), self.img_rgb ) 
                    
    def get_result(self):
        try:
            return self.img_rgb
        except Exception:
            return None
