import { Request, Response } from "express";
import { connectToDatabase as db } from "../services/database";
import { logger } from "../server";
import { AddIDPayload, EditIDPayload } from "../types";

export default {
  /**
   * Offer user's `email` and `drone ID` to frontend
   */

  async getUserInfo(req: Request, res: Response) {
    try {
      let conn = await db();
      //改成promise
      // const q = "SELECT * FROM user WHERE id=?";
      // const user = conn.query(
      //   q,
      //   [res.locals.id],
      //   function (err: any, results: any) {
      //     if (err) throw err;
      //     console.log("results: ", results);
      //     res.send(results);
      //   }
      // );
      //Promise
      const select_user = async function () {
        return new Promise(function (resolve, reject) {
          console.log(res.locals.uuid);
          let sql = "SELECT * FROM user WHERE id=?";
          conn.query(sql, [res.locals.uuid], function (err: any, result: any) {
            if (err) {
              reject(err);
              return;
            }
            // console.log("promise: ", result);
            let dataSTring = JSON.stringify(result);
            let data = JSON.parse(dataSTring);
            console.log("data: ", data);
            resolve(data[0]);
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
            //FIXME
            //user table裡面沒有droneID，這邊要改
            // droneId: user.droneId,
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
      //FIXME
      //add select here
      // const userRepo = getRepository(User);
      // const user = await userRepo.findOne({ where: { id: res.locals.uuid } });

      //MYSQL
      const update_droneID = async function () {
        let conn = await db();
        return new Promise(function (resolve, reject) {
          let sql =
            " UPDATE drones SET drones.drone_id = ? WHERE drones.user_id = (SELECT id FROM user WHERE id = ?);";
          conn.query(
            sql,
            [droneId, res.locals.uuid],
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
      let insertData: string[][] = [];
      droneId.forEach((element: string) => {
        let tmp = [res.locals.uuid, element];
        insertData.push(tmp);
      });
      
      //MySQL
      const enroll_droneId = async function () {
        let conn = await db();
        return new Promise(function (resolve, reject) {
          let sql = " INSERT INTO drones(user_id, drone_id) VALUES ?;";
          conn.query(sql, [insertData], function (err: any, result: any) {
            if (err) {
              reject(err);
              console.log("[ERROR IN add_droneID]");
              return;
            }
            let dataSTring = JSON.stringify(result);
            let data = JSON.parse(dataSTring);
            resolve(data[0]);
            return;
          });
        });
      };

      await enroll_droneId();
      res.json({ msg: "Drone ID added!" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
};
