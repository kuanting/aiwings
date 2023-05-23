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

// CREATE TABLE user(id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,email VARCHAR(100) NOT NULL ,password VARCHAR(100) NOT NULL, drone_id INT);
// CREATE TABLE drones(id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, user_id INT NOT NULL, drone_id VARCHAR(100) ,isAdmin boolean DEFAULT false, FOREIGN KEY(user_id) REFERENCES user(id));
// CREATE TABLE  IF NOT EXISTS user(id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,email VARCHAR(100) NOT NULL ,password VARCHAR(100) NOT NULL);

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
    // 創建 user 表格
    const createUserTableSql = 'CREATE TABLE IF NOT EXISTS user (id BINARY(16)  NOT NULL PRIMARY KEY,email VARCHAR(100) NOT NULL ,password VARCHAR(100) NOT NULL)';
    db.query(createUserTableSql, function(err: Error, result:any) {
      if (err) {
        logger.error(err);
      } else {
        logger.info("User table created!");
      }
    });
    
    // 創建 drones 表格
    const createDronesTableSql = 'CREATE TABLE IF NOT EXISTS drones (id BINARY(16)  NOT NULL PRIMARY KEY, user_id BINARY(16) NOT NULL, drone_id VARCHAR(100), isAdmin boolean DEFAULT false, FOREIGN KEY(user_id) REFERENCES user(id))';
    db.query(createDronesTableSql, function(err: Error, result:any) {
      if (err) {
        logger.error(err);
      } else {
        logger.info("Drones table created!");
      }
    });
    
    logger.info("Connect to database successfully!");

    /** 以下用來測試是否能成功在database【Mysql資料庫】創建表格，可以表示server有真的成功連上 */
    /* 
    var a = (`CREATE TABLE articles2 (
      id     INT PRIMARY KEY AUTO_INCREMENT,
      author VARCHAR(100) NOT NULL,
      title  VARCHAR(100) NOT NULL,
      body   TEXT         NOT NULL
    )`);
    
    db.query(a, function (err: any, result: any) {
      if (err) {
        console.error("err: ",err);
        return;
      }
      // 印出執行成功的result
      console.error("result: ",result);
    });*/
    return db;
  } catch (err) {
    logger.error(err);
    setTimeout(connectToDatabase, 5000);
  }
}

/* 搜尋 "資料庫" 中 "指定用戶" 的 "droneId" */ 
/* 成功回傳true，失敗回傳false */
export async function select_droneId(conn:any, uuid:any, droneid:string) {
  return new Promise(function (resolve, reject) {
    console.log(`在資料庫中搜尋DroneID: 「${droneid}」是否存在: `)
    let sqlsearch=
      'SELECT  drone_id FROM drones WHERE drones.user_id = UUID_TO_BIN(?) AND drones.drone_id = ?;'
    conn.query(sqlsearch, [uuid, droneid], function (err: any, result: any){
      if (err) {
        reject(err);
        console.log("搜尋drone_id出現錯誤: ",err)
        return;
      }

      if(result.length>0){ //如果有搜尋到id，表示此id已存在，不必再新增
        console.log(`ID名: ${droneid} ,已存在`)
        resolve(true);
        return
      }else{
        console.log(`ID名: ${droneid} ,尚未註冊`)
        resolve(false);
        return
      }
    });
  });
};




