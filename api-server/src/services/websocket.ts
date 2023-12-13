import { io, logger } from "../server";
import { Replies } from "amqplib";
import { Socket } from "socket.io";
import { channel } from "../services/rabbitmq";
import { Command } from "../types/drone";

const RABBITMQ = {
  EXCHANGE_NAME: "drone",
  EXCHANGE_TYPE: "topic",
  QUEUE_TOPICS: ["drone", "webrtc"],
};

// binding key design: {user_uuid}.{drone_uuid}.{mavlink}, {user_uuid}.{drone_uuid}.{webrtc}
export default () => {
  // When establish connection
  io.on("connection", (socket: Socket) => {
    logger.info(`Websocket connected: ${socket.id}`);
    let droneId: { id: string }[];
    // let queues: Replies.AssertQueue[] = [];
    let queues_drone: Replies.AssertQueue[] = [];
    let queues_webrtc: Replies.AssertQueue[] = [];
    let consumers: Replies.Consume[] = [];
    let adminQueue: Replies.AssertQueue;

    // Inital RabbitMQ
    socket.on("establish-rabbitmq-connection-drone", async (receiveId: { id: string }[]) => {
      console.log("DroneID List(webSocket): ", receiveId);
      droneId = receiveId;
      // console.log(droneId);
      try {
        // 1. Create exchange
        await channel.assertExchange(
          RABBITMQ.EXCHANGE_NAME,
          RABBITMQ.EXCHANGE_TYPE,
          { durable: false }
        );
        // 2. Create topic queue
        await assertTopicQueue(socket.id, droneId, "drone", queues_drone) // queue name: "`${socket.id}-${droneId[key].id}-drone`"
        // 3. Bind topic queue (phone)
        await bindTopicQueue(droneId, "drone", queues_drone);
        // 4. Started to recieved message
        await consumeTopicQueue();

        queues_drone.forEach((queue) => {
          // Telling frontend that queues have been created
          socket.emit("queue-created", queue.queue);
        });
      } catch (error) {
        logger.error(error);
      }

      async function consumeTopicQueue() {
        for (let i = 0; i < queues_drone.length; i++) {
          //if divisible means the topic is "drone" else means "webrtc"
          // 建立消費者，制定其監聽的對象佇列，並指定收到佇列內的消息時要執行的callback函式
          const consume = await channel.consume(
            queues_drone[i].queue,
            (msg) => {
              if (msg) {
                // console.log('drone-topic messages: ', JSON.parse(msg.content.toString()))
                console.log('drone-topic messages: ')
                socket.emit(
                  //drone-topic
                  `${RABBITMQ.QUEUE_TOPICS[0]}-topic`,
                  JSON.parse(msg.content.toString())
                );
              }
            },
            { noAck: true }
          );
          consumers.push(consume);

        }
      }
    });

    socket.on("establish-rabbitmq-connection-webrtc", async (receiveId: { id: string }[]) => {
      console.log("DroneID List(webSocket-webrtc): ", receiveId);
      droneId = receiveId;
      try {
        // 1. Create exchange
        await channel.assertExchange(
          RABBITMQ.EXCHANGE_NAME,
          RABBITMQ.EXCHANGE_TYPE,
          { durable: false }
        );
        // 2. Create topic queue
        await assertTopicQueue(socket.id, droneId, "webrtc",queues_webrtc) // queue name: "`${socket.id}-${droneId[key].id}-webrtc`"
        // 3. Bind topic queue (phone)
        await bindTopicQueue(droneId, "webrtc", queues_webrtc);
        // 4. Started to recieved message
        await consumeTopicQueue();

        queues_webrtc.forEach((queue) => {
          // Telling frontend that queues have been created
          socket.emit("queue-created", queue.queue);
        });
      } catch (error) {
        logger.error(error);
      }


      async function consumeTopicQueue() {
        for (let i = 0; i < queues_webrtc.length; i++) {
          // 建立消費者，制定其監聽的對象佇列，並指定收到佇列內的消息時要執行的callback函式
          const consume = await channel.consume(
            queues_webrtc[i].queue,
            (msg) => {
              if (msg) {
                console.log('webrtc messages: ', Object.assign(JSON.parse(msg.content.toString()), droneId[i]))
                socket.emit(
                  //webrtc-topic
                  `${RABBITMQ.QUEUE_TOPICS[1]}-topic`,
                  // JSON.parse(msg.content.toString())
                  Object.assign(JSON.parse(msg.content.toString()), droneId[i])
                );
              }
            },
            { noAck: true }
          );
          consumers.push(consume);
        }
      }
    });


    // For management used(in views/Management.vue)
    socket.on("drone-admin", async () => {
      try {
        adminQueue = await channel.assertQueue("admin-drone", {
          autoDelete: true,
          durable: false,
        });
        await channel.bindQueue(
          adminQueue.queue,
          RABBITMQ.EXCHANGE_NAME,
          `*.phone.${RABBITMQ.QUEUE_TOPICS[0]}`
        );
        const consume = await channel.consume(
          adminQueue.queue,
          (msg) => {
            if (msg) {
              socket.emit(
                `admin-${RABBITMQ.QUEUE_TOPICS[0]}-topic`,
                JSON.parse(msg.content.toString())
              );
            }
          },
          { noAck: true }
        );
        consumers.push(consume);
      } catch (error) {
        logger.error(error);
      }
    });

    // Drone-related

    socket.on("send-drone", (command: Command) => {
      console.log("socket-> send-drone: ", command);
      channel.publish(
        RABBITMQ.EXCHANGE_NAME,
        `${command.droneID}.web.drone`,
        Buffer.from(JSON.stringify(command))
      );
    });


    // WebRTC-related
    socket.on("send-webrtc", (data) => {
      // console.log("socket-> send-webrtc: ", data);
      console.log("socket-> send-webrtc---ID: ", data.droneID);

      channel.publish(
        RABBITMQ.EXCHANGE_NAME,
        `${data.droneID}.web.webrtc`,
        Buffer.from(JSON.stringify(data))
      );
    });

    // Terminate receiving message
    socket.on("cancel-consume", async () => {
      try {
        if (consumers.length) {
          await cancelConsuming();
          // queues = [];
          queues_drone = [];
          queues_webrtc = [];
          consumers = [];
          logger.info(`${socket.id} cancel consume message trigger by event`);
        }
      } catch (error) {
        logger.error(error);
      }
    });

    // Handle WebSocket disconnect
    socket.on("disconnect", async (reason) => {
      logger.info(`Websocket disconnected:${socket.id} Reason:${reason}`);
      try {
        if (consumers.length) {
          await cancelConsuming();
          // queues = [];
          queues_drone = [];
          queues_webrtc = [];
          consumers = [];
          logger.info(
            `${socket.id} cancel consume message trigger by disconnection`
          );
        }
      } catch (error) {
        logger.error(error);
      }
    });

    async function cancelConsuming() {
      for (let consume of consumers) {
        await channel.cancel(consume.consumerTag);
      }
    }


    // 自定義型別
    type UserDroneId = {id: string};
    /* ***********************************************************
    * Create topic queue
    * 將用戶的所有 droneId 聲明成佇列，並統一放入queues陣列中
    * drone_or_webrtc: 決定用於傳送drone或是webrtc 
    * ***********************************************************/
    async function assertTopicQueue(socketId:string, droneId: UserDroneId[], drone_or_webrtc:string, queues:Replies.AssertQueue[]) {
      for (let key in droneId) {
        // 聲明一個佇列（如果不存在則建立）
        const queue = await channel.assertQueue(
          `${socketId}-${droneId[key].id}-${drone_or_webrtc}`,
          {
            autoDelete: true, // 是否自动删除
            durable: false,   // 是否持久化
          }
        );
        queues.push(queue);
      }
    }

    /************************************************************
     * Assert a routing path from an exchange to a queue: the exchange named by source will relay messages to the queue named, according to the type of the exchange and the pattern given. 
     * 為佇列建立 Binding key 
     * ***********************************************************/

    async function bindTopicQueue(droneId: {id: string}[], drone_or_webrtc:string, queues:Replies.AssertQueue[]) {
      for (let i = 0; i < queues.length; i++) {
        await channel.bindQueue(
          queues[i].queue,
          RABBITMQ.EXCHANGE_NAME,
          `${droneId[i].id}.phone.${drone_or_webrtc}`
        );
      }
    }
     /************************************************************
     * 
     * ***********************************************************/
    

  })
  

 

};
