import { Request, Response } from "express";
import { connectToDatabase as db , closeConnect} from "../services/database";
import { isEmailExists, insert_user, select_userAccountData} from "../services/database";
import { compareEncryption, encryptPlaintext, signJwtToken } from "../helpers";
import { LoginField, SignupField } from "../types";
import { logger } from "../server";

export default {
  /***************************************************
   * User signup
  ****************************************************/
  async signup(req: Request, res: Response) {
    console.log("------ [auth.ts] ------ signup() ------");
    // console.log("\n 用戶輸入的註冊資料req.body= ",req.body);

    const { email, password, checkPassword }: SignupField = req.body;
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
      res.status(400).json({ msg: "Password must equal or longer than 8 character" });
      return;
    }
    try {
      let conn = await db();
      const result = await isEmailExists(conn, email)
      if(result){
        res.status(400).json({ msg: "Email exist" });
        return;
      }else{
        const encryptPassword = await encryptPlaintext(password); // 將使用者輸入的密碼進行加密
        await insert_user(conn, email, encryptPassword)
        logger.info(`User email ${email} has successfully signed up.`)
        res.status(201).json({ msg: "User Created" });
      }
      closeConnect(conn)

    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /***************************************************
   * User login
  ****************************************************/
  async login(req: Request, res: Response) {
    console.log("------ [auth.ts] ------ login() ------");
    // console.log("用戶輸入的登入資料req.body= ",req.body);

    const { email, password }: LoginField = req.body;
    if (email.trim() === "" || password.trim() === "") {
      res.status(400).json({ msg: "Required field is empty" });
      return;
    }

    try {
      let conn = await db();
      const user = await select_userAccountData(conn, email);
      closeConnect(conn) // 資料庫使用完畢，關閉資料庫
      console.log("The user data corresponding to this email: ", user);
      if(!user){
        res.status(401).json({ msg: "This email user does not exist." }); //用401提醒用戶輸入錯誤
        return;
      }else if (!(await compareEncryption(password, user.password))) {
        res.status(401).json({ msg: "Invalid password " });
        return;
      }

      // console.log("用戶存在，建立 accessToken 和 refreshToken 並存於cookie中回傳用戶端")
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
      
      logger.info(`'${email}' user login.`)
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: "Internal server error" });
    }
  },

  /***************************************************
   * Issue new access token to the frontend for user validation                                      
  ***************************************************/
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

  /***************************************************
   * User logout
  ****************************************************/
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