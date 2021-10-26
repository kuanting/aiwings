import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { logger } from '../server';
import { EditIDPayload } from '../types';

export default {
  /**
   * Offer user's `email` and `drone ID` to frontend
   */
  async getUserInfo(req: Request, res: Response) {
    try {
      const userRepo = getRepository(User);
      const user = await userRepo.findOne({ where: { id: res.locals.uuid } });
      if (user) {
        res
          .cookie('access_token', res.locals.accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 5,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            secure: process.env.NODE_ENV === 'production'
          })
          .json({
            email: user.email,
            droneId: user.droneId,
            isAdmin: user.isAdmin
          });
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  },

  /**
   * Edit user's `drone ID`
   */
  async editUserDroneId(req: Request, res: Response) {
    const { droneId }: EditIDPayload = req.body;
    try {
      const userRepo = getRepository(User);
      const user = await userRepo.findOne({ where: { id: res.locals.uuid } });
      await userRepo.save({
        ...user,
        droneId
      });
      res.json({ msg: 'Drone ID updated' });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  }
};
