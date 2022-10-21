import "reflect-metadata";
import { logger } from "../server";
const mysql = require('mysql');

const {
  MYSQL_SERVICE_SERVICE_HOST,
  MYSQL_SERVICE_SERVICE_PORT = "3306",
  MYSQL_SERVICE_USER,
  MYSQL_SERVICE_PASSWORD,
} = process.env;

// CREATE TABLE drones( id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, user_id INT NOT NULL,  FOREIGN KEY(user_id) REFERENCES user(id));
// CREATE TABLE drones(   id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, user_id INT NOT NULL, drone_id VARCHAR(100) , FOREIGN KEY(user_id) REFERENCES user(id));


export async function connectToDatabase() {
  try {
    let db = await mysql.createConnection({
      host: MYSQL_SERVICE_SERVICE_HOST,
      port: +MYSQL_SERVICE_SERVICE_PORT,
      user: MYSQL_SERVICE_USER,
      password: MYSQL_SERVICE_PASSWORD,
      database: "drone_cloud_test",
    });
    logger.info("Connect to database successfully!");
    return db;
  } catch (err) {
    logger.error(err);
    setTimeout(connectToDatabase, 5000);
  }
}

