import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Flight } from '../entity/Flight';
import { User } from '../entity/User';
import { logger } from '../server';

export default {
  async saveFlightRecords(req: Request, res: Response) {
    const { records } = req.body;

    try {
      const userRepo = getRepository(User);
      const flightRepo = getRepository(Flight);
      const user = await userRepo.findOne(res.locals.uuid);
      const flight = flightRepo.create({ record: records, user });
      await flightRepo.save(flight);

      res.status(201).json({ msg: 'Flight records were saved!' });
    } catch (error) {
      res.status(500).json({ msg: 'Internal server error' });
      logger.error(error);
    }
  },

  async getFlightRecords(req: Request, res: Response) {
    const uuid: string = res.locals.uuid;

    try {
      const flightRepo = getRepository(Flight);
      const records = await flightRepo.find({
        where: { user: uuid }
      });
      res.json({ records });
    } catch (error) {
      res.status(500).json({ msg: 'Internal server error' });
      logger.error(error);
    }
  },

  async getFlightRecord(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const flightRepo = getRepository(Flight);
      const record = await flightRepo.findOne(id);
      res.json({ record });
    } catch (error) {
      res.status(500).json({ msg: 'Internal server error' });
      logger.error(error);
    }
  }
};
