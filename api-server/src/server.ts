import { config } from 'dotenv';
if (process.env.NODE_ENV !== 'production') config();
import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createLogger, format, transports } from 'winston';
import { Server } from 'socket.io';
import routes from './routes';
import useSocketIO from './services/websocket';
import { connectToDatabase as useDatabase } from './services/database';
import { connectToRabbitmq as useRabbitmq } from './services/rabbitmq';

// Create express application
const app = express();

app.set('trust proxy', process.env.NODE_ENV === 'production');

// Create server
const server =
  process.env.NODE_ENV === 'production'
    ? https.createServer(
        { key: process.env.TLS_KEY, cert: process.env.TLS_CERT },
        app
      )
    : http.createServer(app);

// Logger
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

// Server settings
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

// WebSocket server
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
