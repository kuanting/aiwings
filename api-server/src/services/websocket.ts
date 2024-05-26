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
        await assertTopicQueue() // queue name: "`${socket.id}-${droneId[key].id}-drone`"
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
      async function assertTopicQueue() {
        for (let key in droneId) {
          // console.log("Create topic queue >>", `${socket.id}-${droneId[key].id}-drone`)
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
          // console.log("queue =", queues[i].queue, "/ bind =", `${droneId[i].id}.phone.drone`)
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
          // 建立消費者，制定其監聽的對象佇列，並指定收到佇列內的消息時要執行的callback函式
          const consume = await channel.consume(
            queues[i].queue,
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
        await assertTopicQueue();// queue name: "`${socket.id}-${droneId[key].id}-webrtc`"
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
      async function assertTopicQueue() {
        for (let key in droneId) {
          // console.log("Create topic queue >>", `${socket.id}-${droneId[key].id}-webrtc`)
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
          // console.log("queue =", queues[i].queue, "/ bind =", `${droneId[i].id}.phone.webrtc`)
          await channel.bindQueue(
            queues[i].queue,
            RABBITMQ.EXCHANGE_NAME,
            `${droneId[i].id}.phone.webrtc`
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
                // console.log('webrtc-topic messages: ')
                socket.emit(
                  //webrtc-topic
                  `${RABBITMQ.QUEUE_TOPICS[1]}-topic`,
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
    socket.on("send-webrtc", (data: any) => {
      // console.log("socket-> send-webrtc: ", data);
      console.log("socket-> send-webrtc---ID: ", data.droneID, data.type);

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
          queues = [];
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
          // queues = [];
          queues = [];
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

  })
};
