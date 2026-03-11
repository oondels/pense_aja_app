import { Router } from "express";
import { AiToolsController } from "../controllers/ai-tools.controller";

const router = Router();

router.post("/improve-text", AiToolsController.improveText);

export default router;
