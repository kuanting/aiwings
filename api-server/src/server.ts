import { config } from 'dotenv';
if (process.env.NODE_ENV !== 'production') config();
import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createLogger, format, transports } from 'winston';
import { Server } from 'socket.io';
import routes from './routes';
import useSocketIO from './services/websocket';
import useDatabase from './services/database';
import useRabbitmq from './services/rabbitmq';

const app = express();
const server = http.createServer(app);

const { combine, timestamp, printf } = format;
const logger = createLogger({
  format: combine(
    timestamp(),
    printf(({ level, message, timestamp }) => {
      return `[${level}]-[${timestamp}] ${message}`;
    })
  ),
  transports: [new transports.Console()]
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    maxAge: 300
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(routes);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL
  }
});

useSocketIO();
useDatabase();
useRabbitmq();

server.listen(Number(process.env.BACKEND_SERVICE_SERVICE_PORT), () => {
  logger.info(
    `Server is listening on port ${process.env.BACKEND_SERVICE_SERVICE_PORT}`
  );
});

export { logger, io };
