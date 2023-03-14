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
    let queues: Replies.AssertQueue[] = [];
    let consumers: Replies.Consume[] = [];
    let adminQueue: Replies.AssertQueue;

    // Inital RabbitMQ
    socket.on("establish-rabbitmq-connection-drone", async (receiveId: { id: string }[]) => {
      console.log("DroneID List(webSocket): ", receiveId);
      // console.log(Object.keys(receiveId).length);
      // console.log(Object.keys(receiveId));
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
        await assertTopicQueue();
        // 3. Bind topic queue (phone)
        await bindTopicQueue();
        // 4. Started to recieved message
        await consumeTopicQueue();

        queues.forEach((queue) => {
          // Telling frontend that queues have been created
          socket.emit("queue-created", queue.queue);
        });
      } catch (error) {
        logger.error(error);
      }

      //assert queue 是創建queue 等待exchange後的結果
      //創建queue，如果沒有的話會自動生成
      async function assertTopicQueue() {
        for (let key in droneId) {
            // console.log("droneId in assertQueue: ", key);
            const queue = await channel.assertQueue(
              `${socket.id}-${droneId[key].id}-drone`,
              {
                autoDelete: true,
                durable: false,
              }
            );
            queues.push(queue);
        }
      }

      //Assert a routing path from an exchange to a queue: the exchange named by source will relay messages to the queue named,
      // according to the type of the exchange and the pattern given.
      async function bindTopicQueue() {
        for (let i = 0; i < queues.length; i++) {
          // console.log(queues[i].queue);
            await channel.bindQueue(
              queues[i].queue,
              RABBITMQ.EXCHANGE_NAME,
              `${droneId[i].id}.phone.drone`
            );
        }
      }

      async function consumeTopicQueue() {
        for (let i = 0; i < queues.length; i++) {
          //if divisible means the topic is "drone" else means "webrtc"
            const consume = await channel.consume(
              queues[i].queue,
              (msg) => {
                if (msg) {
                  console.log('drone-topic messages: ', JSON.parse(msg.content.toString()))
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
        await assertTopicQueue();
        // 3. Bind topic queue (phone)
        await bindTopicQueue();
        // 4. Started to recieved message
        await consumeTopicQueue();

        //這邊要再看一下
        queues.forEach((queue) => {
          // Telling frontend that queues have been created
          socket.emit("queue-created", queue.queue);
        });
      } catch (error) {
        logger.error(error);
      }

      //assert queue 是創建queue 等待exchange後的結果
      //創建queue，如果沒有的話會自動生成
      async function assertTopicQueue() {
        for (let key in droneId) {
            // console.log("droneId in assertQueue: ", key);
            const queue = await channel.assertQueue(
              `${socket.id}-${droneId[key].id}-webrtc`,
              {
                autoDelete: true,
                durable: false,
              }
            );
            queues.push(queue);
        }
      }

      //Assert a routing path from an exchange to a queue: the exchange named by source will relay messages to the queue named,
      // according to the type of the exchange and the pattern given.
      async function bindTopicQueue() {
        for (let i = 0; i < queues.length; i++) {
          // console.log(droneId[i].id);
            await channel.bindQueue(
              queues[i].queue,
              RABBITMQ.EXCHANGE_NAME,
              `${droneId[i].id}.phone.webrtc`
            );
          
        }
      }

      async function consumeTopicQueue() {
        for (let i = 0; i < queues.length; i++) {
            const consume = await channel.consume(
              queues[i].queue,
              (msg) => {
                if (msg) {
                  console.log('webrtc messages: ', JSON.parse(msg.content.toString()))
                  socket.emit(
                    //webrtc-topic
                    `${RABBITMQ.QUEUE_TOPICS[1]}-topic`,
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
    //如果要操作多台，前端需要回傳droneID， 因為要知道是誰傳過來的，這樣就可以知道要傳給誰
    //droneID 可以用array來傳，這樣在操作多台可以一次傳入多台相同的cmd

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
          queues = [];
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
          queues = [];
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
  });
};
