import { Router } from "express";
import { verifyToken } from "../middlewares/auth";
import roleVerificationAccess from "../middlewares/roleVerificationMiddleware";
import { PenseAjaController } from "../controllers/pense-aja.controller";

const router = Router();

// Products
router.get("/products/:dassOffice", PenseAjaController.listProducts);
router.put(
  "/purchase/:registration",
  verifyToken,
  roleVerificationAccess,
  PenseAjaController.purchaseProduct
);
router.put(
  "/products/:dassOffice",
  verifyToken,
  roleVerificationAccess,
  PenseAjaController.updateProducts
);

// Pense e aja
router.get("/:dassOffice", PenseAjaController.listIdeas);
router.post("/:dassOffice", PenseAjaController.createIdea);
router.get("/:dassOffice/:id", PenseAjaController.getIdeaById);
router.put(
  "/avaliar/:id",
  verifyToken,
  roleVerificationAccess,
  PenseAjaController.evaluateIdea
);

export default router;
