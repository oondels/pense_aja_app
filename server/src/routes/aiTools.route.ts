import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AiToolsController } from "../controllers/ai-tools.controller";

const router = Router();

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas requisições ao serviço de IA. Tente novamente em breve." },
});

router.post("/improve-text", aiRateLimit, AiToolsController.improveText);

export default router;
