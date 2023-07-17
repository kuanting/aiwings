import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_TOKEN_SECRET || "";

/* 加密訊息 */
const encryptPlaintext = async (plainText: string) => {
  return await bcrypt.hash(plainText, 10);
};

/* 比較加密訊息 */
const compareEncryption = async (plainText: string, encryption: string) => {
  return await bcrypt.compare(plainText, encryption);
};

/* 註冊新token */
const signJwtToken = (
  expireDuration: string | number,
  payload: object
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET, { expiresIn: expireDuration }, (err, token) => {
      if (err) return reject(err);
      if (token) return resolve(token);
    });
  });
};

/* 驗證 JSON Web Token (JWT) */
const verifyJwtToken = (token: string) => {
  return new Promise((resolve, reject) =>
    /* 用 jwt.verify() 方法來做 JWT 驗證 */
    // token：要被驗證的token
    // SECRET：用於驗證簽名的密鑰或公鑰
    // (err, payload) ：驗證完後callback的結果
    // err：驗證過程中的錯誤（如果有）
    // payload：解碼後的令牌信息（包含令牌中的聲明信息）
    jwt.verify(token, SECRET, (err, payload) => {
      if (err) {
        reject("");
        return;
      }
      console.log("payload in helpers: ", payload);
      resolve(payload);
    })
  );
};

export { encryptPlaintext, compareEncryption, signJwtToken, verifyJwtToken };
