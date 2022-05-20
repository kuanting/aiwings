import { io, logger } from '../server';
import { Replies } from 'amqplib';
import { Socket } from 'socket.io';
import { channel } from '../services/rabbitmq';
import { Command } from '../types/drone';

const RABBITMQ = {
  EXCHANGE_NAME: 'drone',
  EXCHANGE_TYPE: 'topic',
  QUEUE_TOPICS: ['drone', 'webrtc']
};

export default () => {
  // When establish connection
  io.on('connection', (socket: Socket) => {
    logger.info(`Websocket connected: ${socket.id}`);
    let droneId: string;
    let queues: Replies.AssertQueue[] = [];
    let consumers: Replies.Consume[] = [];
    let adminQueue: Replies.AssertQueue;

    // Inital RabbitMQ
    socket.on('establish-rabbitmq-connection', async (receiveId: string) => {
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

        queues.forEach((queue) => {
          // Telling frontend that queues have been created
          socket.emit('queue-created', queue.queue);
        });
      } catch (error) {
        logger.error(error);
      }

      async function assertTopicQueue() {
        for (let topic of RABBITMQ.QUEUE_TOPICS) {
          const queue = await channel.assertQueue(
            `${socket.id}-${receiveId}-${topic}`,
            {
              autoDelete: true,
              durable: false
            }
          );
          queues.push(queue);
        }
      }

      async function bindTopicQueue() {
        for (let i = 0; i < queues.length; i++) {
          await channel.bindQueue(
            queues[i].queue,
            RABBITMQ.EXCHANGE_NAME,
            `${receiveId}.phone.${RABBITMQ.QUEUE_TOPICS[i]}`
          );
        }
      }

      async function consumeTopicQueue() {
        for (let i = 0; i < queues.length; i++) {
          const consume = await channel.consume(
            queues[i].queue,
            (msg) => {
              if (msg) {
                socket.emit(
                  `${RABBITMQ.QUEUE_TOPICS[i]}-topic`,
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

    // For management used
    socket.on('drone-admin', async () => {
      try {
        adminQueue = await channel.assertQueue('admin-drone', {
          autoDelete: true,
          durable: false
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
    socket.on('send-drone', (command: Command) => {
      channel.publish(
        RABBITMQ.EXCHANGE_NAME,
        `${droneId}.web.drone`,
        Buffer.from(JSON.stringify(command))
      );
    });

    // WebRTC-related
    socket.on('send-webrtc', (data) => {
      channel.publish(
        RABBITMQ.EXCHANGE_NAME,
        `${droneId}.web.webrtc`,
        Buffer.from(JSON.stringify(data))
      );
    });

    // Terminate receiving message
    socket.on('cancel-consume', async () => {
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
    socket.on('disconnect', async (reason) => {
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
