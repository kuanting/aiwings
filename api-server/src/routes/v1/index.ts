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
// router.get("/user/login", verifyTokens, user.loginUser);
router.put("/user/drones", verifyTokens, user.addNewDrones);
router.put("/user/drones/:droneId", verifyTokens, user.editUserDroneId);
router.delete("/user/drones/:droneId", verifyTokens, user.deleteDrone);

// save image from DroneVideoBlob
var multer  = require('multer')
const upload = multer()
router.post("/user/upload/images", verifyTokens, upload.array("files"), user.saveDroneVideoBlob);


// // 分段接收(還在測試)
// router.post("/user/test", verifyTokens, upload.array("files"), user.test);



// router.get('/drone/records', verifyTokens, drone.getFlightRecords);
// router.get('/drone/records/:id', verifyTokens, drone.getFlightRecord);
// router.post('/drone/records', verifyTokens, drone.saveFlightRecords);

// /users/1/drones/:id to access multi droneID

export default router;
