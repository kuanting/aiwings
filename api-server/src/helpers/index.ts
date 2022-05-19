import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_TOKEN_SECRET || '';

const encryptPlaintext = async (plainText: string) => {
  return await bcrypt.hash(plainText, 10);
};

const compareEncryption = async (plainText: string, encryption: string) => {
  return await bcrypt.compare(plainText, encryption);
};

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

const verifyJwtToken = (token: string) => {
  return new Promise((resolve, reject) =>
    jwt.verify(token, SECRET, (err, payload) => {
      if (err) {
        reject('');
        return;
      }
      resolve(payload);
    })
  );
};

export { encryptPlaintext, compareEncryption, signJwtToken, verifyJwtToken };
