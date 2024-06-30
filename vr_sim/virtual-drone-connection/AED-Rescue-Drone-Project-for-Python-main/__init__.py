from time import sleep
from dronekit import connect
import threading

from my_vehicle import MyVehicle
from drone_command import Drone_command
from drone_message import Drone_message
from RabbitMQ import RabbitMQ


def consume():
    rabbitmq_consumer = RabbitMQ(vehicle=drone_cmd)
    rabbitmq_consumer.consume()


def start_consume():
    threaad_consumer = threading.Thread(target=consume)
    threaad_consumer.setDaemon(True)
    threaad_consumer.start()


if __name__ == "__main__":
    CONNECTION_STRING = "tcp:127.0.0.1:5762"
    print("Connecting to vehicle on: %s" % CONNECTION_STRING)

    drone = connect(CONNECTION_STRING, wait_ready=False, vehicle_class=MyVehicle)

    drone_cmd = Drone_command(vehicle=drone)
    rabbitmq_producer = RabbitMQ()
    drone_msg = Drone_message(vehicle=drone, rabbitmq=rabbitmq_producer)

    drone.add_attribute_listener(
        "GLOBAL_POSITION_INT", drone_msg.GLOBAL_POSITION_INT_callback
    )
    drone.add_attribute_listener("SYS_STATUS", drone_msg.SYS_STATUS_callback)
    drone.add_attribute_listener("VFR_HUD", drone_msg.VFR_HUD_callback)
    drone.add_attribute_listener("ATTITUDE", drone_msg.ATTITUDE_callback)
    drone.add_attribute_listener("GPS_RAW_INT", drone_msg.GPS_RAW_INT_callback)
    drone.add_attribute_listener("HEARTBEAT", drone_msg.HEARTBEAT_callback)
    drone.add_attribute_listener("COMMAND_ACK", drone_msg.COMMAND_ACK_callback)
    drone.add_attribute_listener("STATUSTEXT", drone_msg.STATUS_TEXT_callback)
    drone.add_attribute_listener("MISSION_ACK", drone_msg.MISSION_ACK_callback)

    threaad = threading.Thread(target=drone_msg.Publish_MESSAGE)
    threaad.setDaemon(True)
    threaad.start()

    start_consume()

    while True:
        try:
            print("is Conneted. . .")
            sleep(10)
        except KeyboardInterrupt:
            break
