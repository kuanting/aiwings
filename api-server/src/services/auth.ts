import e, { Request, Response } from "express";
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
    console.log(req.body);
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
      conn.query(findEmail, [email], function (err: any, results: any) {
        if (err) throw err;
        //if entered email is existed
        if (results.length > 0) {
          res.status(400).json({ msg: "Email exist" });
          return;
        }
      });

      const encryptPassword = await encryptPlaintext(password);
      let insertNewUser = "INSERT INTO user(email, password) VALUES(?, ?);";
      conn.query(
        insertNewUser,
        [email, encryptPassword],
        function (err: any, results: any) {
          if (err) throw err;
          console.log(results);
          res.status(201).json({ msg: "User created" });
        }
      );
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

    if (email.trim() === "" || password.trim() === "") {
      res.status(400).json({ msg: "Required field is empty" });
      return;
    }

    try {
      //FIXME
      let conn = await db();

      // const findUser = "SELECT id, email, password FROM user WHERE email=?";

      //ORIGIN IN MYSQL DOC

      // conn.query(findUser, [email], function (err: any, results: any) {
      //   if (err) throw err;
      //   //if entered email is not existed
      //   if (results.length === 0) {
      //     res.status(401).json({ msg: "Account not found" });
      //     return;
      //   }
      //   console.log(results);
      // });

      //use primise to get password from SQL-select
      const select_user = async function () {
        return new Promise(function (resolve, reject) {
          let sql = "SELECT id, email, password FROM user WHERE email=?";
          conn.query(sql, [email], function (err: any, result: any) {
            if (err) {
              reject(err);
              return;
            }
            // console.log("promise: ", result);
            let dataSTring = JSON.stringify(result);
            let data = JSON.parse(dataSTring);
            // console.log("data", data);
            resolve(data[0]);
            return;
          });
        });
      };

      const user: any = await select_user();
      if (!(await compareEncryption(password, user.password))) {
        res.status(401).json({ msg: "Invalid password " });
        return;
      }

      //SEELCT DRONEID is enrolled or not
      const select_drone = async function () {
        return new Promise(function (resolve, reject) {
          let sql =
            "SELECT drone_id from user, drones WHERE user_id = user.id;";
          conn.query(sql, [email], function (err: any, result: any) {
            if (err) {
              reject(err);
              return;
            }
            // console.log("promise: ", result);

            let dataSTring = JSON.stringify(result);
            let data = JSON.parse(dataSTring);
            resolve(data[0]);
            return;
          });
        });
      };
      let drone: any = await select_drone();

      if (drone === undefined) {
        drone = false;
        console.log(drone);
      } else {
        drone = true;
        console.log(drone);
      }

      const accessToken = await signJwtToken("5m", { uuid: user.id });
      const refreshToken = await signJwtToken("30d", { uuid: user.id });
      // console.log(accessToken, refreshToken);
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
        .json({ msg: "User login", isEnrolled: drone });
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
