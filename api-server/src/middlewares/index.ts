import { Request, Response, NextFunction } from "express";
import { signJwtToken, verifyJwtToken } from "../helpers";
import { CookiePayload, TokenPayload } from "../types";

// 更新續訂Token，如果成功就傳遞給下一個函式
const renewTokenAndPassToNext = async (
  res: Response,
  next: NextFunction,
  token: string
) => {
  // console.log("middlewares/index-> res: ", res);
  const { uuid } = (await verifyJwtToken(token)) as TokenPayload; //驗證並解析Token
  // 如果驗證失敗，verifyJwtToken(token)會回傳錯誤狀態
  const accessToken = await signJwtToken("5m", { uuid });
  res.locals.uuid = uuid;
  res.locals.accessToken = accessToken;
  next(); // 前往下一個函式
};

// 驗證Token 
// 失敗回傳帶有狀態碼 401 的 JSON 響應
// 成功則進入下一個函式(next: NextFunction)繼續執行【根據Router/index.ts】
export const verifyTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("========================================\nreq = ",req)
  const { access_token, refresh_token }: CookiePayload = req.cookies;
  console.log("=========== verifyTokens ============")

  try {
    console.log("驗證: 客戶端回傳的access_token = ", access_token)
    await renewTokenAndPassToNext(res, next, access_token);
  } catch (error) {
    try {
      console.log("access_token驗證失敗\n 驗證: 客戶端回傳的refresh_token = ", refresh_token)
      await renewTokenAndPassToNext(res, next, refresh_token);
    } catch (error) {
      console.log("refresh_token驗證失敗，回傳客戶端 { msg: \"Unauthorize, Please login\" }")
      res.status(401).json({ msg: "Unauthorize, Please login" });
    }
  }

  console.log("=========== verifyTokens END ============")
};
