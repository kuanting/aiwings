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

const mysql_config = {
  host: MYSQL_SERVICE_SERVICE_HOST,
  port: +MYSQL_SERVICE_SERVICE_PORT,
  user: MYSQL_SERVICE_USER,
  password: MYSQL_SERVICE_PASSWORD,
  database: "drone_cloud_test",
  multipleStatements: true
}

/**********************************************
 * The connection must be closed after using the database.
**********************************************/
export async function closeConnect(conn: any) {
  try {
    conn.end() // close connection
    logger.info("db connect is closed.");
  } catch (err) {
    logger.info("Can not close db connect");
  }
}

/**************************************************
 * Connect to the database.
 * Success: Return conn
**************************************************/
// Usage: let conn = await connectToDatabase()
export async function connectToDatabase() {
  while (true) {
    try {
      const conn: any = await tryToConnectDB()
      logger.info("Connect to database successfully!");
      return conn // 如果連線成功，回傳conn；如果失敗，進入catch(err){}
    } catch (err) {
      logger.error(err)
    }
    // Retry the connection after a 5-second delay.
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function tryToConnectDB() {
  let conn = await mysql.createConnection(mysql_config);

  // Try to connect to the database.
  return new Promise((resolve, reject) => {
    conn.connect((err: any) => {
      if (err)
        reject(err)
      else
        resolve(conn);
    })
  })
}

/**************************************************
 * Execute the SQL statement. 
 * (Not export; use it only in database.ts.)
 * If you are searching for data, regardless of the number of results found (0 to n records), it will be returned in an array format.
***************************************************/
async function executeSQLStatement(conn: any, sql: any, ...param: any) {
  return new Promise((resolve, reject) => {
    conn.query(sql, param, function (err: Error, result: any) {
      if (err)
        reject(err)
      else {
        resolve(result)
      }
    });
  })
}

/***************************************************
 * Ensure that the 'user' table and 'drones' table have been created.
****************************************************/
export async function createTable(conn: any) {
  logger.info("Ensure that the 'user' table and 'drones' table have been created.")
  try {
    // If the 'user' table does not exist, then create it.
    const createUserTableSql = `
      CREATE TABLE IF NOT EXISTS user (
        id BINARY(16)  NOT NULL PRIMARY KEY,
        email VARCHAR(100) NOT NULL ,
        password VARCHAR(100) NOT NULL
      );`
    await executeSQLStatement(conn, createUserTableSql)
    logger.info("User table is created!")

    // If the 'drones' table does not exist, then create it.
    const createDronesTableSql = `
      CREATE TABLE IF NOT EXISTS drones (
        id BINARY(16)  NOT NULL PRIMARY KEY, 
        user_id BINARY(16) NOT NULL, 
        drone_id VARCHAR(100), 
        isAdmin boolean DEFAULT false, 
        FOREIGN KEY(user_id) REFERENCES user(id)
      );`
    await executeSQLStatement(conn, createDronesTableSql)
    logger.info("Drones table is created!")
  } catch (err) {
    console.log("createTable() error")
    throw err
  }
}


/***************************************************
 * Register a new user.
***************************************************/
export async function insert_user(conn: any, email: string, encryptPassword: string) {
  try {
    logger.info(`Added email '${email}' as a new user: `)
    let sql = `INSERT INTO user(id, email, password) VALUES(UUID_TO_BIN(UUID()),?, ?)`
    await executeSQLStatement(conn, sql, email, encryptPassword)
  } catch (err) {
    console.log("insert_user() error")
    throw err
  }
}

/***************************************************
 * Register a new droneId for "specified user (UUID)"
***************************************************/
export async function insert_droneIdForUser(conn: any, uuid: string, newDroneId: string) {
  try {
    logger.info(`Register a new droneId '${newDroneId}' for specified user: `)
    let sql = 
      `INSERT INTO drones(id, user_id, drone_id) VALUES ( UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?)`
    await executeSQLStatement(conn, sql, uuid, newDroneId)
  } catch (err) {
    console.log("insert_droneIdForUser() error")
    throw err
  }
}

/***************************************************
 * Delete the "existing droneId" for the "specified user(UUID)."
***************************************************/
export async function delete_droneIdForUser(conn: any, uuid: string, DroneId: string) {
  try {
    logger.info(`Delete the existing droneId '${DroneId}' for the specified user: `)
    let sql = 
      `DELETE FROM drones 
      WHERE user_id = UUID_TO_BIN(?) AND drone_id = ?`
    await executeSQLStatement(conn, sql, uuid, DroneId)
  } catch (err) {
    console.log("delete_droneIdForUser() error")
    throw err
  }
}

/***************************************************
 * Check if the "specified email" exists.
 * Success: Return true; 
 * Failure: Return false.
***************************************************/
export async function isEmailExists(conn: any, email: string) {
  try {
    logger.info(`Check if the email '${email}' exists. `)
    let sql = `SELECT 1 FROM user WHERE email=? limit 1`
    const result: any = await executeSQLStatement(conn, sql, email)
    //如果有搜尋到id，表示此id已存在，不必再新增
    if (result.length > 0) {
      logger.info(`Email: '${email}' already exists.`)
      return true
    } else {
      logger.info(`Email: '${email}' is not registered.`)
      return false
    }
  } catch (err) {
    console.log("isEmailExists() error")
    throw err
  }
};

/***************************************************
 * Check if the "specified user(uuid)" has the "specified droneId."
 * Success: Return true; 
 * Failure: Return false.
***************************************************/
// const a = await isDroneIdExistsByUuid(conn, 'fifi@example.com','fifi')
// console.log(a)
export async function isDroneIdExistsByUuid(conn: any, uuid: any, droneId: string) {
  try {
    logger.info(`Check if the specified user has the droneId '${droneId}'.`)
    let sql =
      `SELECT 1 FROM drones 
      WHERE drones.user_id = UUID_TO_BIN(?) AND drones.drone_id = ?
      limit 1` // Since each user's drone is unique and non-repeating, you can end the search once found.
    const result: any = await executeSQLStatement(conn, sql, uuid, droneId)

    if (result.length > 0) {
      logger.info(`ID name: '${droneId}' already exists.`)
      return true
    } else {
      logger.info(`ID name: '${droneId}' is not registered.`)
      return false
    }
  } catch (err) {
    console.log("isDroneIdExistsByUuid() error")
    throw err
  }
};

/***************************************************
 * Select the data of the "specified email"
 * Success: Return the "id," "email," and "password."
***************************************************/
export async function select_userAccountData(conn: any, email: string) {
  try {
    logger.info(`Select the data of the email '${email}': `)
    let sql =
      `SELECT BIN_TO_UUID(id) id, email, password 
      FROM user 
      WHERE email=? 
      limit 1` // Because each email will have only one set of data, you can end the search once found.
    const result: any = await executeSQLStatement(conn, sql, email)

    if (result.length > 0) {
      let dataSTring = JSON.stringify(result);
      let data = JSON.parse(dataSTring);
      // console.log(data[0].id)
      return data[0]
    } else {
      return null
    }
  } catch (err) {
    console.log("select_userAccountData() error")
    throw err
  }
};

/***************************************************
 * Select the email of the "specified user(uuid)"
 * Success: Return 'email'
****************************************************/
export async function select_userEmail(conn: any, uuid: string) {
  try {
    logger.info(`Select the email of the specified user: `)
    let sql =
      `SELECT email FROM user WHERE user.id=UUID_TO_BIN(?) limit 1`
    const result: any = await executeSQLStatement(conn, sql, uuid)

    if (result.length > 0) {
      return result[0].email
    } else {
      logger.warn("Exception: The email for this user was expected to be found but was not.")
    }
  } catch (err) {
    console.log("select_userEmail() error")
    throw err
  }
};

/***************************************************
 * Select all the drone-related data for the "specified user (UUID)".
 * Success: Return
 *          [ { id: "Drone1's ID name", isAdmin: "a boolean value" },
 *            // ... more entries
 *          ]; 
 * If there are no results: Return []
****************************************************/
export async function select_userDroneIds_isAdmin(conn: any, uuid: string) {
  try {
    logger.info(`Select all the drone-related data for the specified user: `)
    let sql =
      `SELECT drone_id, isAdmin FROM drones 
      WHERE user_id=UUID_TO_BIN(?)`
    const result: any = await executeSQLStatement(conn, sql, uuid)

    // Return the search results in an array format. 
    // Even if no results are found, it will return [].
    let dataSTring = JSON.stringify(result);
    let data = JSON.parse(dataSTring);
    return data

  } catch (err) {
    console.log("select_userDroneIds_isAdmin() error")
    throw err
  }

}

/***************************************************
 * Update the name of the "specified user's (UUID)" "droneID."
****************************************************/
export async function update_droneID(conn: any, newDroneId: string, uuid: string, originDroneId: string) {
  try {
    logger.info(`Change the specified user's droneID name  from "${originDroneId}" to "${newDroneId}": `)
    let sql =
      `UPDATE drones 
      SET drone_id = ?  
      WHERE user_id = UUID_TO_BIN(?) AND drone_id= ?`
    await executeSQLStatement(conn, sql, newDroneId, uuid, originDroneId)
  } catch (err) {
    console.log("update_droneID() error")
    throw err
  }
}
