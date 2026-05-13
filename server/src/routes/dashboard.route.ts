import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

const router = Router();

// resumo de dados
router.get("/summary/:dassOffice", DashboardController.getSummary);

// Rota para obter dados mensais do dashboard
router.get("/monthly/:dassOffice", DashboardController.getMonthly);

// Rota para obter dados dimensionais do dashboard
router.get("/dimensional/:dassOffice", DashboardController.getDimensional);

// Rota para obter ideias em destaque
router.get("/idea-highlights/:dassOffice", DashboardController.getIdeaHighlights);

// Rota para obter dados de engajamento dos colaboradores
router.get("/engagement/:dassOffice", DashboardController.getEngagement);

export default router;
