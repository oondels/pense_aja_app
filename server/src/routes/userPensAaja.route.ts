import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import {
  requirePermission,
  requireSelfOrPermission,
} from "../middlewares/permissionMiddleware";
import { UserPenseajaController } from "../controllers/user-penseaja.controller";

const router = Router();

router.get(
  "/rbac/roles",
  verifyToken,
  UserPenseajaController.listRbacRoles
);
router.get(
  "/rbac/assignments",
  verifyToken,
  UserPenseajaController.listRbacAssignments
);
router.get(
  "/rbac/assignments/:id",
  verifyToken,
  UserPenseajaController.getRbacAssignmentById
);
router.post(
  "/rbac/assignments",
  verifyToken,
  UserPenseajaController.createRbacAssignment
);
router.put(
  "/rbac/assignments/:id",
  verifyToken,
  UserPenseajaController.updateRbacAssignment
);
router.delete(
  "/rbac/assignments/:id",
  verifyToken,
  UserPenseajaController.deleteRbacAssignment
);
router.get(
  "/session-context/:dassOffice",
  verifyToken,
  UserPenseajaController.getSessionContext
);
router.get("/unidade/:registration", UserPenseajaController.getUserOffice);
router.post(
  "/:registration/points-adjustments",
  verifyToken,
  requirePermission("points.adjust", (req) => req.body?.dassOffice),
  UserPenseajaController.createPointsAdjustment
);
router.get(
  "/:registration/points-history",
  verifyToken,
  requireSelfOrPermission(
    "marketplace.request.approve",
    (req) => {
      const office = req.query.dassOffice;
      return typeof office === "string" ? office : undefined;
    },
    (req) => req.params.registration
  ),
  UserPenseajaController.getUserPointsHistory
);
router.get("/:registration", UserPenseajaController.getUserData);
router.put("/:registration", verifyToken, UserPenseajaController.updateUserData);

export default router;
