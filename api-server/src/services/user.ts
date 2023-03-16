import { Request, Response } from "express";
import { connectToDatabase as db } from "../services/database";
import { logger } from "../server";
import { AddIDPayload, EditIDPayload } from "../types";
export default {
  /**
   * Offer user's `email` and `drone ID` to frontend
   */

  async loginUser(req: Request, res: Response) {
    try {
      let conn = await db();
      //Promise
      const select_user = async function () {
        return new Promise(function (resolve, reject) {
          // console.log("uuid: ", res.locals.uuid);
          // let sql = " SELECT email,drone_id FROM user INNER JOIN drones WHERE user.id=UUID_TO_BIN(?);";
          let sql = " SELECT email FROM user  WHERE user.id=UUID_TO_BIN(?);";

          conn.query(sql, [res.locals.uuid], function (err: any, result: any) {
            if (err) {
              reject(err);
              return;
            }
            console.log("getUserInfo: ", result);
            // handle object for userInfo
            type droneId = {
              [key: string]: any;
            };
            let drone: droneId = new Object();

            for (const index in result) {
              drone[index] = result[index].drone_id;
            }
            let userInfo = {
              email: result[0].email,
              droneId: drone,
            };
            let dataSTring = JSON.stringify(userInfo);
            let data = JSON.parse(dataSTring);
            resolve(data);
            return;
          });
        });
      };

      const user: any = await select_user();
      // console.log("user.ts: ", user);

      // console.log("user.ts: ", user);
      if (user) {
        res
          .cookie("access_token", res.locals.accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 5,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            secure: process.env.NODE_ENV === "production",
          })
          .json({
            email: user.email,
            droneId: user.droneId,
            isAdmin: user.isAdmin,
          });
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
  //login時只要select email，但accountform需要多搜尋droneID
  //拆開來寫
  async getUserInfo(req: Request, res: Response) {
    try {
      let conn = await db();
      type droneId = {
        [key: string]: any;
      };

      //Promise
      const select_user = async function () {
        return new Promise(function (resolve, reject) {
          console.log("uuid: ", res.locals.uuid);
          //fixed me
          let sql =
            "SELECT email,drone_id, isAdmin FROM drones LEFT JOIN user ON user.id=drones.user_id WHERE user.id=UUID_TO_BIN(?);SELECT email FROM user  WHERE user.id=UUID_TO_BIN(?);";
          // let sql = " SELECT email FROM user  WHERE user.id=UUID_TO_BIN(?);";

          conn.query(
            sql,
            [res.locals.uuid, res.locals.uuid],
            function (err: any, result: any) {
              if (err) {
                reject(err);
                return;
              }
              // console.log("result[0]: ", result[0]);
              // console.log("resulr[1]: ", result[1]);
              if (result[0].length == 0) {
                //if user haven't enrolled droneID
                // let drone: droneId = new Object();
                let drone:  { id: string }[] = []
                let userInfo = {
                  email: result[1][0].email,
                  droneId: drone,
                  isAdmin: result[1][0].isAdmin
                };
                let dataSTring = JSON.stringify(userInfo);
                let data = JSON.parse(dataSTring);
                resolve(data);
                return;
              } else {
                // handle object for userInfo
                // user has enrolled droneID
                let drone:  { id: string }[] = []

                //把它key改成都是id
                //應該要改成array然後append，變成[{ID:XXXX}, {ID:XXXXX}, {ID:XXXXX}]
                for (const index in result[0]) {
                  // drone[index] = result[0][index]['drone_id'];
                  drone.push({id: result[0][index]['drone_id']})
                }
                let userInfo = {
                  email: result[0][0].email,
                  droneId: drone,
                  isAdmin: result[0][0].isAdmin
                };
                // console.log("else: ", userInfo);
                let dataSTring = JSON.stringify(userInfo);
                let data = JSON.parse(dataSTring);
                resolve(data);
                return;
              }
            }
          );
        });
      };
      const user: any = await select_user();
      console.log("user.ts: ", user);

      if (user) {
        res
          .cookie("access_token", res.locals.accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 5,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            secure: process.env.NODE_ENV === "production",
          })
          .json({
            email: user.email,
            droneId: user.droneId,
            isAdmin: user.isAdmin,
          });
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /**
   * Edit user's `drone ID`
   */

  //FIXED ME
  async editUserDroneId(req: Request, res: Response) {
    const { droneId }: EditIDPayload = req.body;
    try {
      //MYSQL
      const update_droneID = async function () {
        let conn = await db();
        return new Promise(function (resolve, reject) {
          //FIXME
          //要找到原來的id 插入第三個變數
          console.log(req.body.droneId);
          console.log(req.body.originDroneId);
          let sql =
            " UPDATE drones SET drones.drone_id = ? WHERE (drones.user_id = (SELECT id FROM user WHERE id = ?)) AND (drones.drone_id= ?);";
          conn.query(
            sql,
            [droneId, res.locals.uuid, req.body.originDroneId],
            function (err: any, result: any) {
              if (err) {
                reject(err);
                console.log("[ERROR IN update_droneID]");
                return;
              }
              let dataSTring = JSON.stringify(result);
              let data = JSON.parse(dataSTring);
              resolve(data[0]);
              return;
            }
          );
        });
      };

      await update_droneID();
      res.json({ msg: "Drone ID updated" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  //New feature: Add new drones
  async addNewDrone(req: Request, res: Response) {
    const { droneId }: AddIDPayload = req.body;
    try {
      //preprocessor
      console.log(typeof droneId, ...droneId);
      let insertData: string[] = [];
      droneId.forEach((element: string) => {
        // let tmp = [res.locals.uuid, element];
        insertData.push(element);
      });
      // console.log(insertData);

      //MySQL
      const enroll_droneId = async function (droneid: string) {
        let conn = await db();
        return new Promise(function (resolve, reject) {
          let sql =
            " INSERT INTO drones(id, user_id, drone_id) VALUES ( UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?);";
          conn.query(
            sql,
            [res.locals.uuid, droneid],
            function (err: any, result: any) {
              if (err) {
                reject(err);
                console.log("[ERROR IN add_droneID]");
                return;
              }
              let dataSTring = JSON.stringify(result);
              let data = JSON.parse(dataSTring);
              resolve(data[0]);
              return;
            }
          );
        });
      };

      for (const index in droneId) {
        await enroll_droneId(droneId[index]);
      }
      res.json({ msg: "Drone ID added!" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
};