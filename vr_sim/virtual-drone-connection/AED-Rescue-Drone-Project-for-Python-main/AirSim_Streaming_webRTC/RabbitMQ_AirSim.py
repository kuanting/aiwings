import pika
import threading

EXCHANGE_NAME = 'drone'

import sys
sys.path.append('..')  # 添加上一級目錄到 Python 的路徑中
import config
# DRONE_ID = 'airsim_simulation'
# ROUTING_KEY_WEBRTC = DRONE_ID + ".phone.webrtc"
# BINDING_KEY_WEBRTC = DRONE_ID + ".web.webrtc"

class RabbitMQ_AirSim():

    def __init__(self):
        auth = pika.PlainCredentials(config.RabbitMQ_USERNAME, config.RabbitMQ_PASSWORD)
        parameters= pika.ConnectionParameters(host=config.RabbitMQ_HOST, port=5672, virtual_host='/', credentials=auth)
        connection = pika.BlockingConnection(parameters)
        self.channel = connection.channel()
        self.channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic')

        # 創建柱列
        # self.result = self.channel.queue_declare("airsim_simulation_WebRTC", exclusive=True)
        queueName = config.DRONE_ID + "_WebRTC"
        self.result = self.channel.queue_declare(queueName, exclusive=True)
        self.queue_name = self.result.method.queue # 取得queue名稱【透過這種方式順便確認queue順利創建成功】
        self.channel.queue_bind(exchange=EXCHANGE_NAME, queue=self.queue_name, routing_key=config.BINDING_KEY_WEBRTC)

    def publish(self, message):
        self.channel.basic_publish(exchange=EXCHANGE_NAME, routing_key=config.ROUTING_KEY_WEBRTC, body=message)
        print("====== publish offer=====")

    def consume(self, callback):
        # result = self.channel.queue_declare('AirSim_Simulation_WebRTC', exclusive=True)
        # queue_name = self.result.method.queue
        # self.channel.queue_bind(exchange=EXCHANGE_NAME, queue=queue_name, routing_key=BINDING_KEY_WEBRTC)

        self.channel.basic_consume(queue=self.queue_name, on_message_callback=callback, auto_ack=True)
        self.channel.start_consuming()

