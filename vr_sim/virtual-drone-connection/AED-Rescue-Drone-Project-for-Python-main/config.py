DRONE_ID = "airsim3_simulation"

# key for droneMessage
ROUTING_KEY_DRONE = DRONE_ID + ".phone.drone"
BINDING_KEY_DRONE = DRONE_ID + ".web.drone"  # 接收web端傳來的，對drone的指令

# key for webRTC
ROUTING_KEY_WEBRTC = DRONE_ID + ".phone.webrtc"
BINDING_KEY_WEBRTC = DRONE_ID + ".web.webrtc"

# RabbitMQ connection parameters
RabbitMQ_HOST = "192.168.50.76"
RabbitMQ_USERNAME = "guest"
RabbitMQ_PASSWORD = "guest"
