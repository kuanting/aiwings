import { Request, Response } from "express";
import { connectToDatabase as db, closeConnect, connectToDatabase } from "../services/database";
import { isDroneIdExistsByUuid, select_userEmail, select_userDroneIds_isAdmin, update_droneID, insert_droneIdForUser,delete_droneIdForUser} from "../services/database";
import { logger } from "../server";
import { AddIDPayload, EditIDPayload } from "../types";
export default {
  // /***************************************************
  //  * Offer user's `email` and `drone ID` to frontend
  // ***************************************************/
  // async loginUser(req: Request, res: Response) {
  //   console.log("------ [user.ts] ------ loginUser() ------\nres.locals = ", res.locals);
  //   // res.locals包含 uuid 和 accessToken 的值
  //   try {
  //     let conn: any = await db();
  //     //Promise
  //     const select_user = async function () {
  //       return new Promise(function (resolve, reject) {
  //         // console.log("uuid: ", res.locals.uuid);
  //         // let sql = " SELECT email,drone_id FROM user INNER JOIN drones WHERE user.id=UUID_TO_BIN(?);";
  //         let sql = " SELECT email FROM user  WHERE user.id=UUID_TO_BIN(?);";

  //         conn.query(sql, [res.locals.uuid], function (err: any, result: any) {
  //           if (err) {
  //             reject(err);
  //             return;
  //           }
  //           console.log("------ [user.ts] ------ loginUser() ------\nselect_user(): ", result);
  //           // handle object for userInfo
  //           type droneId = {
  //             [key: string]: any;
  //           };
  //           let drone: droneId = new Object();

  //           for (const index in result) {
  //             drone[index] = result[index].drone_id;
  //           }
  //           let userInfo = {
  //             email: result[0].email,
  //             droneId: drone,
  //           };
  //           let dataSTring = JSON.stringify(userInfo);
  //           let data = JSON.parse(dataSTring);
  //           resolve(data);
  //           return;
  //         });
  //       });
  //     };

  //     const user: any = await select_user();
  //     // console.log("user.ts: ", user);

  //     if (user) {
  //       res
  //         .cookie("access_token", res.locals.accessToken, {
  //           httpOnly: true,
  //           maxAge: 1000 * 60 * 5,
  //           sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  //           secure: process.env.NODE_ENV === "production",
  //         })
  //         .json({
  //           email: user.email,
  //           droneId: user.droneId,
  //           isAdmin: user.isAdmin,
  //         });
  //     }
  //   } catch (error) {
  //     logger.error(error);
  //     res.status(500).json({ msg: "Internal server error" });
  //   }
  // },

  // login時只要select email，但accountform需要多搜尋droneID
  //  * 拆開來寫

  /***************************************************
   * Retrieve the user data requested by the client.
   * Including this user's email, all droneIDs, and drone's isAdmin
  ***************************************************/
  async getUserInfo(req: Request, res: Response) {
    console.log("------ [user.ts] ------ getUserInfo() ------");
    // `res.locals` contains the client's UUID and accessToken.

    try {
      let conn = await db();
      let userEmail = await select_userEmail(conn, res.locals.uuid)
      let userDroneIds_isAdmin = await select_userDroneIds_isAdmin(conn, res.locals.uuid)
      closeConnect(conn)

      // The reason for changing the property name is that the current frontend application retrieves values using `.id`.
      if (userDroneIds_isAdmin) {
        userDroneIds_isAdmin = userDroneIds_isAdmin.map((item: any) => {
          // Use destructuring assignment to rename the property 'drone_id' to 'id'
          const { drone_id: id, ...rest } = item;
          return { id, ...rest };
        });
      }

      let userInfo = {
        email: userEmail,
        droneId: userDroneIds_isAdmin,
        isAdmin: false
      };
      // console.log("userInfo = ", userInfo)

      // 每個droneId會有一個對應的isAdmin
      // 猜測可能是因為大學長寫的是單台無人機，所以將droneId和isAdmin分開無差
      // 變成多台無人機後，可能因為isAdmin暫時沒有影響，或者因為全都是0暫無差，所以依舊另外給isAdmin屬性
      // 為了配合格式以免影響前端，暫時保留userInfo的isAdmin屬性

      if (userInfo) {
        res
          .cookie("access_token", res.locals.accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 5,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            secure: process.env.NODE_ENV === "production",
          })
          .json({
            email: userInfo.email,
            droneId: userInfo.droneId,
            isAdmin: userInfo.isAdmin,
          });
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /***************************************************
   * Edit user's `drone ID`
  ***************************************************/

  //FIXED ME
  async editUserDroneId(req: Request, res: Response) {
    console.log("------ [user.ts] ------ editUserDroneId() ------");
    const { droneId }: EditIDPayload = req.body;
    // console.log("更改後的droneId: ", req.body.droneId);
    // console.log("原本的droneId: ", req.body.originDroneId);
    // console.log("res.locals.uuid: ", res.locals.uuid)
    try {
      let conn = await db();
      /*Confirm if the changed DroneId exists.*/
      if (await isDroneIdExistsByUuid(conn, res.locals.uuid, req.body.droneId)) {
        console.log("This DroneId name already exists.")
        res.json({ msg: "This Drone ID already exists!" }); 
      }else{
        /*Change droneId name*/   
        await update_droneID(conn, droneId, res.locals.uuid, req.body.originDroneId);
        closeConnect(conn)
        logger.info("Drone ID updated")
        res.json({ msg: "Drone ID updated" });
      }
      
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /***************************************************
   * Add new drones for user
  ***************************************************/
  async addNewDrone(req: Request, res: Response) {
    console.log("------ [user.ts] ------ addNewDrone() ------",);
    const { droneId }: AddIDPayload = req.body;
    try {
      //MySQL
      let conn = await db();
      for (const index in droneId) {
        // if 'droneId[index]' is not exist
        if (await isDroneIdExistsByUuid(conn, res.locals.uuid, droneId[index]) == false) {
          await insert_droneIdForUser(conn, res.locals.uuid, droneId[index]); // Add this droneId for the user
        }
      }
      closeConnect(conn)
      logger.info("DroneIDs have been successfully added.")
      res.json({ msg: "Drone ID added!" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /***************************************************
   * Delete a drone from user
  ***************************************************/
  async deleteDrone(req: Request, res: Response) {
    console.log("------[user.ts] ------ deleteDrone() ------",);
    const { droneId }: EditIDPayload = req.body;
    try {
      //MYSQL
      const conn = await db()
      await delete_droneIdForUser(conn, res.locals.uuid, droneId)
      closeConnect(conn)
      logger.info(`Drone ID "${droneId}" is delete`)
      res.json({msg: `Drone ID "${droneId}" is delete`});

    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
};