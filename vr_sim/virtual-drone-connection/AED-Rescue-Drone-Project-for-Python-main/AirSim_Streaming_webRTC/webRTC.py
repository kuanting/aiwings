import asyncio
import os
import cv2
from av import VideoFrame

# from main import MyWidget, getImage


from aiortc import (
    RTCPeerConnection,
    RTCConfiguration,
    RTCIceServer,

    RTCSessionDescription,
    VideoStreamTrack,
)
from aiortc.contrib.media import MediaBlackhole

from aiortc.sdp import candidate_from_sdp
import json
import time

from AirSim_GetImage import AirSim_Frame_Thread
from RabbitMQ_AirSim import RabbitMQ_AirSim
import threading

ROOT = os.path.dirname(__file__)
PHOTO_PATH = os.path.join(ROOT, "photo.jpg")

from config import DRONE_ID



# Kris
class AirSim_VideoImageTrack(VideoStreamTrack):
    """
    A video stream track that returns a rotating image.
    """

    def __init__(self):
        super().__init__()  # don't forget this!
        self.img = cv2.imread(PHOTO_PATH, cv2.IMREAD_COLOR)
        self.airsim = AirSim_Frame_Thread()

    async def recv(self):
        pts, time_base = await self.next_timestamp()

        img = self.airsim.get_result()
        try:
            frame = VideoFrame.from_ndarray(img, format="bgr24")

        except AttributeError:
            frame = VideoFrame.from_ndarray(self.img, format="bgr24")

        frame.pts = pts
        frame.time_base = time_base

        return frame


async def main(
        pc, recorder, rabbitmq, answer_list, candidate_list
):
    print("main開始, pc.connectionState = ", pc.connectionState)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print("Connection state is %s, time: %s" % (pc.connectionState, time.ctime()))

    @pc.on("track")
    def on_track(track):
        print("Track %s received" % track.kind)
        recorder.addTrack(track)

    # CrateOffer
    pc.addTrack(AirSim_VideoImageTrack())
    await pc.setLocalDescription(await pc.createOffer())
    sdp_payload = {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
    sdp_dict = {"type": "offer", "payload": sdp_payload}
    json_sdp = json.dumps(sdp_dict)

    # SendOffer
    rabbitmq.publish(json_sdp)

    # Set RabbitMQ consumer
    def consume():
        def callback(ch, method, properties, body):
            # print("/收到來自web的消息：", body)

            # if method.routing_key == "airsim_simulation.web.webrtc"):
            if method.routing_key == (DRONE_ID + ".web.webrtc"):
                msg_from_web_ = body.decode("utf-8")
                msg_from_web_dict = json.loads(msg_from_web_)
                webrtc_type = msg_from_web_dict["type"]
                print("收到 webrtc_type = ",webrtc_type)

                if webrtc_type == "answer":
                    answer_list.append(msg_from_web_dict["payload"])

                elif webrtc_type == "candidate":
                    candidate_list.append(msg_from_web_dict["payload"])

                elif webrtc_type == "offer":
                    print("收到offer")

        rabbitmq.consume(callback)

    def start_consume():
        threaad_consumer = threading.Thread(target=consume)
        threaad_consumer.setDaemon(True)
        threaad_consumer.start()

    start_consume()

    await asyncio.sleep(5)

    # # SendOffer
    # rabbitmq_producer.publish(json_sdp)
    # print("SendOffer 給web端")


    # setRemoteDescription
    for answer in answer_list:
        answer_ = RTCSessionDescription(type=answer["type"], sdp=answer["sdp"])
        await pc.setRemoteDescription(answer_)
        await recorder.start()
        print("receive_answer")

    # addIceCandidate
    for candidate in candidate_list:
        candidate_ = candidate_from_sdp(candidate["candidate"].split(":", 1)[1])
        candidate_.sdpMid = candidate["sdpMid"]
        candidate_.sdpMLineIndex = candidate["sdpMLineIndex"]
        await pc.addIceCandidate(candidate_)
        print("receive_candidate")


if __name__ == "__main__":
    # 創建 iceServers 清單
    ice_servers = [
        RTCIceServer(urls="stun:stun.l.google.com:19302"),
        RTCIceServer(urls="turn:relay1.expressturn.com:3478",
                     username="efJOQ1TXPNAJYW2V54",
                     credential="BQ8uDasm0AkaePjZ")
    ]

    # 創建 RTCConfiguration 物件並設置 iceServers
    configuration = RTCConfiguration(iceServers=ice_servers)

    # pc = RTCPeerConnection(configuration)
    pc = RTCPeerConnection()
    recorder = MediaBlackhole()
    # rabbitmq_producer = RabbitMQ_AirSim()
    # rabbitMQ_consumer = RabbitMQ_AirSim()
    rabbitmq = RabbitMQ_AirSim()
    answer_list = []
    candidate_list = []

    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(
            main(
                pc,
                recorder,
                rabbitmq,
                answer_list,
                candidate_list,
            )
        )
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        loop.run_until_complete(pc.close())
