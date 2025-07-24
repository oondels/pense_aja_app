import { Router, Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/DashboardService";

const router = Router();

// Rota para obter dados do resumo do dashboard
router.get("/summary/:dassOffice", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dassOffice } = req.params;
    const { startDate, endDate } = req.query;

    if (!dassOffice) {
      res.status(400).json({
        erro: true,
        mensagem: "O campo 'dassOffice' é obrigatório.",
      });
      return;
    }

    // Validação das datas se fornecidas
    let startDateParsed: Date | undefined;
    let endDateParsed: Date | undefined;

    if (startDate && typeof startDate === 'string') {
      if (isNaN(Date.parse(startDate))) {
        res.status(400).json({
          erro: true,
          mensagem: "Data de início inválida.",
        });
        return;
      }
      startDateParsed = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      if (isNaN(Date.parse(endDate))) {
        res.status(400).json({
          erro: true,
          mensagem: "Data de fim inválida.",
        });
        return;
      }
      endDateParsed = new Date(endDate);
    }

    const result = await DashboardService.getSummaryData(dassOffice, startDateParsed, endDateParsed);

    res.status(200).json({
      erro: false,
      dados: result
    });
  } catch (error) {
    next(error);
  }
});

// Rota para obter dados mensais do dashboard
router.get("/monthly/:dassOffice", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dassOffice } = req.params;
    const { startDate, endDate } = req.query;

    if (!dassOffice) {
      res.status(400).json({
        erro: true,
        mensagem: "O campo 'dassOffice' é obrigatório.",
      });
      return;
    }

    // Validação das datas se fornecidas
    let startDateParsed: Date | undefined;
    let endDateParsed: Date | undefined;

    if (startDate && typeof startDate === 'string') {
      if (isNaN(Date.parse(startDate))) {
        res.status(400).json({
          erro: true,
          mensagem: "Data de início inválida.",
        });
        return;
      }
      startDateParsed = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      if (isNaN(Date.parse(endDate))) {
        res.status(400).json({
          erro: true,
          mensagem: "Data de fim inválida.",
        });
        return;
      }
      endDateParsed = new Date(endDate);
    }

    const result = await DashboardService.getMonthlyData(dassOffice, startDateParsed, endDateParsed);

    res.status(200).json({
      erro: false,
      dados: result
    });
  } catch (error) {
    next(error);
  }
});

// Rota para obter dados dimensionais do dashboard
router.get("/dimensional/:dassOffice", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dassOffice } = req.params;
    const { startDate, endDate } = req.query;

    if (!dassOffice) {
      res.status(400).json({
        erro: true,
        mensagem: "O campo 'dassOffice' é obrigatório.",
      });
      return;
    }

    // Validação das datas se fornecidas
    let startDateParsed: Date | undefined;
    let endDateParsed: Date | undefined;

    if (startDate && typeof startDate === 'string') {
      if (isNaN(Date.parse(startDate))) {
        res.status(400).json({
          erro: true,
          mensagem: "Data de início inválida.",
        });
        return;
      }
      startDateParsed = new Date(startDate);
    }

    if (endDate && typeof endDate === 'string') {
      if (isNaN(Date.parse(endDate))) {
        res.status(400).json({
          erro: true,
          mensagem: "Data de fim inválida.",
        });
        return;
      }
      endDateParsed = new Date(endDate);
    }

    const result = await DashboardService.getDimensionalData(dassOffice, startDateParsed, endDateParsed);

    res.status(200).json({
      erro: false,
      dados: result
    });
  } catch (error) {
    next(error);
  }
});

// Rota para obter ideias em destaque
router.get("/idea-highlights/:dassOffice", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dassOffice } = req.params;

    if (!dassOffice) {
      res.status(400).json({
        erro: true,
        mensagem: "O campo 'dassOffice' é obrigatório.",
      });
      return;
    }

    const result = await DashboardService.getIdeaHighlights(dassOffice);

    res.status(200).json({
      erro: false,
      dados: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
