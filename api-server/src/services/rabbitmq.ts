import amqp from 'amqplib';
import { logger } from '../server';
let channel: amqp.Channel;

const {
  RABBITMQ_SERVICE_SERVICE_HOST,
  RABBITMQ_SERVICE_SERVICE_PORT = '5672',
  RABBITMQ_SERVICE_USER,
  RABBITMQ_SERVICE_PASSWORD
} = process.env;

export default async () => {
  try {
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: RABBITMQ_SERVICE_SERVICE_HOST,
      port: +RABBITMQ_SERVICE_SERVICE_PORT,
      username: RABBITMQ_SERVICE_USER,
      password: RABBITMQ_SERVICE_PASSWORD
    });
    channel = await connection.createChannel();
    logger.info('Connect to Rabbitmq successfully');
  } catch (error) {
    logger.error(error);
  }
};

export { channel };
