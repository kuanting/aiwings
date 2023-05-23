import express, { Request, Response } from "express";
import { verifyTokens } from "../../middlewares";
import auth from "../../services/auth";
// import drone from '../../services/drone';
import user from "../../services/user";
const router = express.Router();

router.get("/", (req: Request, res: Response) =>
  res.json({ server: "Running" })
);

router.post("/auth/signup", auth.signup);
router.post("/auth/login", auth.login);
router.get("/auth/token", verifyTokens, auth.refreshToken);
router.post("/auth/logout", auth.logout);

router.get("/user/me", verifyTokens, user.getUserInfo);
router.get("/user/login", verifyTokens, user.loginUser);
router.post("/user/droneId", verifyTokens, user.editUserDroneId);
router.post("/user/drones", verifyTokens, user.addNewDrone);
router.post("/user/delete_drones", verifyTokens, user.deleteDrone);

// router.get('/drone/records', verifyTokens, drone.getFlightRecords);
// router.get('/drone/records/:id', verifyTokens, drone.getFlightRecord);
// router.post('/drone/records', verifyTokens, drone.saveFlightRecords);

// /users/1/drones/:id to access multi droneID

export default router;
