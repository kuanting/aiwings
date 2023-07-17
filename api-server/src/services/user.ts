import { Request, Response } from "express";
import { connectToDatabase as db } from "../services/database";
import { select_droneId } from "../services/database";
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
            console.log("------- [user.ts] -------\n------ loginUser() ------\nselect_user()【getUserInfo】: ", result);
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
    console.log("------ [user.ts] ------\n---getUserInfo()---");
    try {
      let conn = await db();
      type droneId = {
        [key: string]: any;
      };

      console.log("------- select_user -----");
      //Promise
      const select_user = async function () {
        return new Promise(function (resolve, reject) {
          console.log("------- uuid ------res.locals.uuid = ", res.locals.uuid);
          //fixed me
          let sql =
            "SELECT email,drone_id, isAdmin FROM drones LEFT JOIN user ON user.id=drones.user_id WHERE user.id=UUID_TO_BIN(?);SELECT email FROM user  WHERE user.id=UUID_TO_BIN(?);";
          // let sql = " SELECT email FROM user  WHERE user.id=UUID_TO_BIN(?);";

          conn.query(sql,[res.locals.uuid, res.locals.uuid],function (err: any, result: any) {
            if (err) {
              reject(err);
              return;
            }

            //問題1-1出現問題的位置，暫時不處理
            if(result.length > 0){
              // console.log("用戶存在")
            }else{
              // console.log("用戶不存在")
            }
            // console.log("select_user---result[0]: ", result[0]);
            // console.log("select_user---resulr[1]: ", result[1]);
            if (result[0].length == 0) {
              console.log("用戶不存在")
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
              console.log("user搜尋結果大於0時, getUserInfo()的promise的resolve回傳值: ",data)
              resolve(data);
              return;
            }
          });
        });
      };
      const user: any = await select_user();
      // console.log("-----user.ts------\n---getUserInfo()---\nuser = ", user);

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
    console.log("------ [user.ts] ------\n---editUserDroneId()---");
    const { droneId }: EditIDPayload = req.body;
    try {
      //MYSQL
      let conn = await db();

      /*確認更改的DroneId存不存在*/
      if(await select_droneId(conn, res.locals.uuid, req.body.droneId)){
        console.log("更改的DroneId已存在")
        res.json({ msg: "This Drone ID already exists!" }); //如果已存在，回傳此訊息並結束
        return
      }

      /*更改droneId*/
      const update_droneID = async function () {
        return new Promise(function (resolve, reject) {
          //FIXME
          //要找到原來的id 插入第三個變數
          console.log("更改後的droneId: ",req.body.droneId);
          console.log("原本的droneId: ",req.body.originDroneId);
          console.log("res.locals.uuid: ",res.locals.uuid)
          // let sql =
          //   " UPDATE drones SET drones.drone_id = ? WHERE (drones.user_id = (SELECT id FROM user WHERE id = ?)) AND (drones.drone_id= ?);";
          let sql =
              "UPDATE drones  SET drones.drone_id = ?  WHERE drones.user_id = UUID_TO_BIN(?) AND (drones.drone_id= ?);"
            //要把 uuid 轉回 bin 才能在 mysql 中搜尋到結果
          conn.query(sql,  [droneId, res.locals.uuid, req.body.originDroneId], function (err: any, result: any) {
              if (err) {
                reject(err);
                console.log("[ERROR IN update_droneID]");
                return;
              }
              // console.log("update_droneID的result= ",result)
              let dataSTring = JSON.stringify(result);
              let data = JSON.parse(dataSTring);
              console.log("update_droneID的resolve資料???:\n",data[0])
              resolve(data[0]);
              // resolve(true)
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
    console.log("------[user.ts]------\n---addNewDrone()---",);
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
      let conn = await db();

      const enroll_droneId = async function (droneid: string) {
        return new Promise(function (resolve, reject) {
          let sql =
            " INSERT INTO drones(id, user_id, drone_id) VALUES ( UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?);";
          conn.query(sql, [res.locals.uuid, droneid], function (err: any, result: any) {            
            if (err) {
              reject(err);
              console.log("[ERROR IN add_droneID]");
              return;
            }
            let dataSTring = JSON.stringify(result);
            let data = JSON.parse(dataSTring);
            // console.log("-----data",data) //???
            console.log("-----data[0]",data[0]) //???
            resolve(data[0]);            
            return;
          })
        })
      }

      for (const index in droneId) {
        if (await select_droneId(conn, res.locals.uuid, droneId[index]) == false){ //如果此droneId不存在
          await enroll_droneId(droneId[index]); //新增此droneId
        }        
      }
      res.json({ msg: "Drone ID added!" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  //New feature: Delete drones
  async deleteDrone(req: Request, res: Response) {
    console.log("------[user.ts]------\n---deleteDrone()---",);
    const { droneId }: EditIDPayload = req.body;
    try {
      //MYSQL
      const delete_droneID = async function () {
        let conn = await db();
        return new Promise(function (resolve, reject) {
          //刪除指定帳號下的指定id
          let sql=
              'DELETE FROM drones WHERE drones.user_id = UUID_TO_BIN(?) AND drones.drone_id = ?;'
          conn.query(sql, [res.locals.uuid, droneId], function (err: any, result: any) {              
            if (err) {
              reject(err);
              console.log("[ERROR IN delete_droneID]");
              return;
            }
            // console.log(">>>result",result)
            resolve(`Drone ID "${droneId}" is delete`);  //沒想好回傳甚麼......
            return
          })
        });
      }
      const dele_msg = await delete_droneID();
      res.json({ msg: dele_msg });
    }catch(error){
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
};