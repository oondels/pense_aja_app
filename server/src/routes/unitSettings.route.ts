import { Router } from "express";
import { UnitSettingsController } from "../controllers/unit-settings.controller";
import { verifyToken } from "../middlewares/auth";
import { requirePermission } from "../middlewares/permissionMiddleware";

const router = Router();

router.get(
  "/:dassOffice",
  verifyToken,
  requirePermission("unit.config.manage", (req) => req.params.dassOffice),
  UnitSettingsController.getSettings
);

router.put(
  "/:dassOffice",
  verifyToken,
  requirePermission("unit.config.manage", (req) => req.params.dassOffice),
  UnitSettingsController.updateSettings
);

export default router;
