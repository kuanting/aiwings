import "reflect-metadata";
import { logger } from "../server";
const mysql = require("mysql");

const {
  MYSQL_SERVICE_SERVICE_HOST,
  MYSQL_SERVICE_SERVICE_PORT = "3306",
  MYSQL_SERVICE_USER,
  MYSQL_SERVICE_PASSWORD,
  NODE_ENV,
} = process.env;

// CREATE TABLE drones(id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, user_id INT NOT NULL, drone_id VARCHAR(100) ,isAdmin boolean DEFAULT false, FOREIGN KEY(user_id) REFERENCES user(id));
// CREATE TABLE user(id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,email VARCHAR(100) NOT NULL ,password VARCHAR(100) NOT NULL,drone_id INT);

export async function connectToDatabase() {
  try {
    let db = await mysql.createConnection({
      host: MYSQL_SERVICE_SERVICE_HOST,
      port: +MYSQL_SERVICE_SERVICE_PORT,
      user: MYSQL_SERVICE_USER,
      password: MYSQL_SERVICE_PASSWORD,
      database: "drone_cloud_test",
      multipleStatements: true 
    });
    logger.info("Connect to database successfully!");
    return db;
  } catch (err) {
    logger.error(err);
    setTimeout(connectToDatabase, 5000);
  }
}
