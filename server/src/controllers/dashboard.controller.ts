import { NextFunction, Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { DashboardDateRange } from "../types/contracts";

const parseDateRange = (req: Request, res: Response): DashboardDateRange | null => {
  const { startDate, endDate } = req.query;

  let parsedStartDate: Date | undefined;
  let parsedEndDate: Date | undefined;

  if (startDate && typeof startDate === "string") {
    if (Number.isNaN(Date.parse(startDate))) {
      res.status(400).json({
        erro: true,
        mensagem: "Data de início inválida.",
      });
      return null;
    }
    parsedStartDate = new Date(startDate);
  }

  if (endDate && typeof endDate === "string") {
    if (Number.isNaN(Date.parse(endDate))) {
      res.status(400).json({
        erro: true,
        mensagem: "Data de fim inválida.",
      });
      return null;
    }
    parsedEndDate = new Date(endDate);
  }

  return { startDate: parsedStartDate, endDate: parsedEndDate };
};

const validateDassOffice = (req: Request, res: Response) => {
  const { dassOffice } = req.params;

  if (!dassOffice) {
    res.status(400).json({
      erro: true,
      mensagem: "O campo 'dassOffice' é obrigatório.",
    });
    return null;
  }

  return dassOffice;
};

export const DashboardController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const dassOffice = validateDassOffice(req, res);
      if (!dassOffice) return;

      const range = parseDateRange(req, res);
      if (!range) return;

      const result = await DashboardService.getSummaryData(
        dassOffice,
        range.startDate,
        range.endDate
      );

      res.status(200).json({ erro: false, dados: result });
    } catch (error) {
      next(error);
    }
  },

  async getMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const dassOffice = validateDassOffice(req, res);
      if (!dassOffice) return;

      const range = parseDateRange(req, res);
      if (!range) return;

      const result = await DashboardService.getMonthlyData(
        dassOffice,
        range.startDate,
        range.endDate
      );

      res.status(200).json({ erro: false, dados: result });
    } catch (error) {
      next(error);
    }
  },

  async getDimensional(req: Request, res: Response, next: NextFunction) {
    try {
      const dassOffice = validateDassOffice(req, res);
      if (!dassOffice) return;

      const range = parseDateRange(req, res);
      if (!range) return;

      const result = await DashboardService.getDimensionalData(
        dassOffice,
        range.startDate,
        range.endDate
      );

      res.status(200).json({ erro: false, dados: result });
    } catch (error) {
      next(error);
    }
  },

  async getIdeaHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const dassOffice = validateDassOffice(req, res);
      if (!dassOffice) return;

      const result = await DashboardService.getIdeaHighlights(dassOffice);
      res.status(200).json({ erro: false, dados: result });
    } catch (error) {
      next(error);
    }
  },

  async getEngagement(req: Request, res: Response, next: NextFunction) {
    try {
      const dassOffice = validateDassOffice(req, res);
      if (!dassOffice) return;

      const range = parseDateRange(req, res);
      if (!range) return;

      const result = await DashboardService.getEngagementData(
        dassOffice,
        range.startDate,
        range.endDate
      );

      res.status(200).json({ erro: false, dados: result });
    } catch (error) {
      next(error);
    }
  },
};
