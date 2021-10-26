import { Request, Response, NextFunction } from 'express';
import { signJwtToken, verifyJwtToken } from '../helpers';
import { CookiePayload, TokenPayload } from '../types';

const renewTokenAndPassToNext = async (
  res: Response,
  next: NextFunction,
  token: string
) => {
  const { uuid } = (await verifyJwtToken(token)) as TokenPayload;
  const accessToken = await signJwtToken('5m', { uuid });
  res.locals.uuid = uuid;
  res.locals.accessToken = accessToken;
  next();
};

export const verifyTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { access_token, refresh_token }: CookiePayload = req.cookies;
  try {
    await renewTokenAndPassToNext(res, next, access_token);
  } catch (error) {
    try {
      await renewTokenAndPassToNext(res, next, refresh_token);
    } catch (error) {
      res.status(401).json({ msg: 'Unauthorize, Please login' });
    }
  }
};
