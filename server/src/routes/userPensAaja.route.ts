import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { UserPenseajaController } from "../controllers/user-penseaja.controller";

const router = Router();

router.get("/:registration", UserPenseajaController.getUserData);
router.get("/unidade/:registration", UserPenseajaController.getUserOffice);
router.put("/:registration", verifyToken, UserPenseajaController.updateUserData);

export default router;
