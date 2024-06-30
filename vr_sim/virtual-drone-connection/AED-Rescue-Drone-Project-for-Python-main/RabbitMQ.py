import pika
from analyze_web_command import analyze_web_json

EXCHANGE_NAME = "drone"
import config

# DRONE_ID = "airsim2_simulation"
# ROUTING_KEY_DRONE = DRONE_ID + ".phone.drone"
# BINDING_KEY_DRONE = DRONE_ID + ".web.drone"  # 接收web端傳來的，對drone的指令


class RabbitMQ:
    def __init__(self, vehicle=None):
        # auth = pika.PlainCredentials("rabbitmq", "aiotlab208")
        # auth = pika.PlainCredentials("user", "rabbitmq")
        auth = pika.PlainCredentials(config.RabbitMQ_USERNAME, config.RabbitMQ_PASSWORD)
        parameters = pika.ConnectionParameters(
            host=config.RabbitMQ_HOST, port=5672, virtual_host="/", credentials=auth
        )
        connection = pika.BlockingConnection(parameters)
        self.channel = connection.channel()
        self.channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type="topic")

        self.vehicle = vehicle

    def publish(self, message):
        # 發布一則帶有routing_key【ROUTING_KEY_DRONE】的訊息【message】到交換機【EXCHANGE_NAME】
        self.channel.basic_publish(
            exchange=EXCHANGE_NAME, routing_key=config.ROUTING_KEY_DRONE, body=message
        )

    def consume(self):
        # result = self.channel.queue_declare("AirSim_Simulation_Drone", exclusive=True)
        queueName = config.DRONE_ID + "_Drone"
        result = self.channel.queue_declare(queueName, exclusive=True)
        queue_name = result.method.queue # 取得queue名稱【透過這種方式順便確認queue順利創建成功】
        self.channel.queue_bind(
            exchange=EXCHANGE_NAME, queue=queue_name, routing_key=config.BINDING_KEY_DRONE
        )

        def callback(ch, method, properties, body):
            if method.routing_key == config.BINDING_KEY_DRONE:
                # print("%r:%r" % ("[WEB_CMD]", body))
                print(">>", body)
                analyze_web_json(self.vehicle, body)

        self.channel.basic_consume(
            queue=queue_name, on_message_callback=callback, auto_ack=True
        )
        self.channel.start_consuming() #用於啟動消費者的訊息監聽循環。一旦呼叫了這個方法，消費者將開始監聽指定佇列，等待訊息的到來，並在訊息到來時觸發對應的回調函數。

