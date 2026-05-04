import { Router } from "express";
import { MarketplaceController } from "../controllers/marketplace.controller";
import { verifyToken } from "../middlewares/auth";
import { requirePermission } from "../middlewares/permissionMiddleware";

const router = Router();

router.get("/catalog/:dassOffice", MarketplaceController.listCatalog);
router.put(
  "/catalog/:dassOffice",
  verifyToken,
  requirePermission("catalog.manage", (req) => req.params.dassOffice),
  MarketplaceController.upsertCatalog
);
router.post(
  "/requests",
  verifyToken,
  requirePermission("marketplace.request.create", (req) => req.body?.dassOffice),
  MarketplaceController.createRequest
);
router.get(
  "/requests",
  verifyToken,
  requirePermission("marketplace.request.approve", (req) => {
    const office = req.query.dassOffice;
    return typeof office === "string" ? office : undefined;
  }),
  MarketplaceController.listRequests
);
router.put(
  "/requests/:id/approve",
  verifyToken,
  requirePermission("marketplace.request.approve", (req) => req.body?.dassOffice),
  MarketplaceController.approveRequest
);
router.put(
  "/requests/:id/reject",
  verifyToken,
  requirePermission("marketplace.request.approve", (req) => req.body?.dassOffice),
  MarketplaceController.rejectRequest
);
router.put(
  "/requests/:id/fulfillment",
  verifyToken,
  requirePermission("marketplace.fulfillment.execute", (req) => req.body?.dassOffice),
  MarketplaceController.executeFulfillment
);
router.put(
  "/requests/:id/complete",
  verifyToken,
  requirePermission("marketplace.fulfillment.execute", (req) => req.body?.dassOffice),
  MarketplaceController.completeRequest
);
router.put(
  "/requests/:id/cancel",
  verifyToken,
  requirePermission("marketplace.cancel", (req) => req.body?.dassOffice),
  MarketplaceController.cancelRequest
);
router.put(
  "/requests/:id/refund",
  verifyToken,
  requirePermission("marketplace.refund", (req) => req.body?.dassOffice),
  MarketplaceController.refundRequest
);

export default router;
