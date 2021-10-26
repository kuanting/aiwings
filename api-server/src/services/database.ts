import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Flight } from '../entity/Flight';
import { User } from '../entity/User';
import { logger } from '../server';

const {
  MYSQL_SERVICE_SERVICE_HOST,
  MYSQL_SERVICE_SERVICE_PORT = '3306',
  MYSQL_SERVICE_USER,
  MYSQL_SERVICE_PASSWORD,
  NODE_ENV
} = process.env;

export default async () => {
  try {
    await createConnection({
      type: 'mysql',
      host: MYSQL_SERVICE_SERVICE_HOST,
      port: +MYSQL_SERVICE_SERVICE_PORT,
      username: MYSQL_SERVICE_USER,
      password: MYSQL_SERVICE_PASSWORD,
      database: 'drone_cloud',
      entities: [User, Flight],
      synchronize: NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'production' ? false : 'all'
    });
    logger.info('Connect to database successfully');
  } catch (error) {
    logger.error(error);
  }
};
