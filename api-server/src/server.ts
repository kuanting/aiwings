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
import {connectToDatabase, createTable, closeConnect} from './services/database'
import { connectToRabbitmq as useRabbitmq } from './services/rabbitmq';

// Create express application
const app = express();

app.set('trust proxy', process.env.NODE_ENV === 'production');

// Create server
const server = http.createServer(app);

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

async function useDatabase() {
  try{
    const conn = await connectToDatabase()
    await createTable(conn);
    closeConnect(conn)
  }catch(err){
    logger.info(err)
  }
}
useDatabase();

useRabbitmq();

server.listen(3080, () => {
  logger.info( `Server is listening on port 3080`);
});

export { logger, io };
