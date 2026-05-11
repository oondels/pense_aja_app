import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import { requirePermission } from "../middlewares/permissionMiddleware";
import { PenseAjaController } from "../controllers/pense-aja.controller";

const router = Router();

// Products
router.get("/products/:dassOffice", PenseAjaController.listProducts);
router.put(
  "/purchase/:registration",
  verifyToken,
  requirePermission("reward.legacy.redeem", (req) => req.body?.dassOffice),
  PenseAjaController.purchaseProduct
);
router.put(
  "/products/:dassOffice",
  verifyToken,
  requirePermission("catalog.manage", (req) => req.params.dassOffice),
  PenseAjaController.updateProducts
);

// Pense e aja
router.get("/:dassOffice", PenseAjaController.listIdeas);
router.post(
  "/:dassOffice",
  verifyToken,
  requirePermission("idea.submit", (req) => req.params.dassOffice),
  PenseAjaController.createIdea
);
router.get(
  "/:dassOffice/:id/audit",
  verifyToken,
  requirePermission("idea.view", (req) => req.params.dassOffice),
  PenseAjaController.getIdeaAuditTimeline
);
router.get("/:dassOffice/:id", PenseAjaController.getIdeaById);
router.put(
  "/avaliar/:id",
  verifyToken,
  requirePermission("idea.evaluate", (req) => req.body?.dassOffice),
  PenseAjaController.evaluateIdea
);

export default router;
