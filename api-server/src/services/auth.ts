import { Request, Response } from "express";
import { connectToDatabase as db } from "../services/database";
import { compareEncryption, encryptPlaintext, signJwtToken } from "../helpers";
import { LoginField, SignupField } from "../types";
import { logger } from "../server";

export default {
  /**
   * User signup
   */
  async signup(req: Request, res: Response) {
    const { email, password, checkPassword }: SignupField = req.body;
    console.log("--- [auth.ts] User signup ---\n 用戶輸入的註冊資料req.body= ",req.body);
    // console.log(email, password, checkPassword);

    if (
      email.trim() === "" ||
      password.trim() === "" ||
      checkPassword.trim() === ""
    ) {
      res.status(400).json({ msg: "Required field is empty" });
      return;
    }

    if (password !== checkPassword) {
      res.status(400).json({ msg: "Password & check password not match" });
      return;
    }

    if (password.length < 8) {
      res
        .status(400)
        .json({ msg: "Password must equal or longer than 8 character" });
      return;
    }
    try {
      let conn = await db();
      const findEmail = "SELECT email FROM user WHERE email=?";
      conn.query(findEmail, [email], async function (err: any, results: any) {
        if (err) throw err;
        //if entered email is existed
        if (results.length > 0) {// 大於0代表後端已經有此email的註冊資料了
          res.status(400).json({ msg: "Email exist" });
          console.log("此email已註冊")
          return;
        }else{
          const encryptPassword = await encryptPlaintext(password);//將使用者輸入的密碼進行加密
          await insert_user(encryptPassword)
        }
      });

      const insert_user = async function (encryptPassword_:string) {
        return new Promise(function (resolve, reject) {
          let insertNewUser =
            "INSERT INTO user(id, email, password) VALUES(UUID_TO_BIN(UUID()),?, ?);";
          conn.query(
            insertNewUser,
            [email, encryptPassword_],
            function (err: any, result: any) {
              if (err) {
                reject(err);
                return;
              }
              res.status(201).json({ msg: "User created" });
              return;
            }
          );
        });
      };
      // await insert_user();

      //   let insertNewUserDrones =
      //   "INSERT INTO drones(id, user_id, drone_id) VALUES(UUID_TO_BIN(UUID()),?, ?);";
      // conn.query(insertNewUserDrones, []);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /**
   * User login
   */

  async login(req: Request, res: Response) {
    const { email, password }: LoginField = req.body;
    console.log("--- [auth.ts] User login ---\n 用戶輸入的登入資料req.body= ",req.body);

    if (email.trim() === "" || password.trim() === "") {
      res.status(400).json({ msg: "Required field is empty" });
      return;
    }

    try {
      let conn = await db();
      //use promise to get password from SQL-select
      const select_user = async function () {
        return new Promise(function (resolve, reject) {
          // let sql = "SELECT BIN_TO_UUID(id) id, email, password FROM user WHERE email=?";
          let sql =
            "SELECT BIN_TO_UUID(id) id, email, password FROM user WHERE email=?";

          conn.query(sql, [email], function (err: any, result: any) {
            if (err) {
              reject(err);
              return;
            }
            if (result.length > 0) {// 大於0代表後端具有此email的用戶註冊資料
              // console.log("promise: ", result);
              let dataSTring = JSON.stringify(result);
              let data = JSON.parse(dataSTring);
              // console.log("data", data);
              resolve(data[0]);
              return;
            }else{
              resolve(null);
              return;
            }
          });
        });
      };

      const user: any = await select_user();
      console.log("login user的資料: ", user); 
      if(!user){
        console.log("此email用戶不存在")
        res.status(401).json({ msg: "此email用戶不存在" }); //用401提醒用戶輸入錯誤
        return;
      }else if (!(await compareEncryption(password, user.password))) {
        res.status(401).json({ msg: "Invalid password " });
        return;
      }

      //SEELCT DRONEID is enrolled or not
      // const select_drone = async function (user: any) {
      //   return new Promise(function (resolve, reject) {
      //     let sql =
      //       "SELECT BIN_TO_UUID(drones.id) AS droneId from drones WHERE drones.user_id = UUID_TO_BIN(?);";
      //     conn.query(sql, [user.id], function (err: any, result: any) {
      //       if (err) {
      //         reject(err);
      //         return;
      //       }

      //       let dataSTring = JSON.stringify(result);
      //       let data = JSON.parse(dataSTring);
      //       resolve(data[0]);
      //       return;
      //     });
      //   });
      // };
      // let drone: any = await select_drone(user);
      // console.log("drone: ", drone);

      // if (drone === undefined) {
      //   drone = false;
      //   console.log(drone);
      // } else {
      //   drone = true;
      //   console.log(drone);
      // }

      const accessToken = await signJwtToken("5m", { uuid: user.id });
      const refreshToken = await signJwtToken("30d", { uuid: user.id });

      res
        .cookie("access_token", accessToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 5,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          secure: process.env.NODE_ENV === "production",
        })
        .cookie("refresh_token", refreshToken, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          secure: process.env.NODE_ENV === "production",
        })
        // .json({ msg: "User login", isEnrolled: drone });
        .json({ msg: "User login" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /**
   * Issue new access token to the frontend for user validation
   */
  refreshToken(req: Request, res: Response) {
    res
      .cookie("access_token", res.locals.accessToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 5,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ msg: "refreshed" });
  },

  /**
   * User logout
   */
  logout(req: Request, res: Response) {
    res
      .clearCookie("access_token", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .send("logout");
  },
};