import { NextFunction, Request, Response } from "express";
import { assertDassOffice } from "../utils/dassOffice";
import { PenseAjaService } from "../services/pense-aja.service";
import {
  EvaluationData,
  PenseAjaData,
  ProductUpdateInput,
  PurchaseProductPayload,
} from "../types/contracts";

const isInvalidDate = (value?: string) => value !== undefined && Number.isNaN(Date.parse(value));

export const PenseAjaController = {
  async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { dassOffice } = req.params;

      if (!dassOffice) {
        res.status(400).json({
          erro: true,
          mensagem: "O campo 'dassOffice' é obrigatório.",
          dados: "Não há registros!",
        });
        return;
      }

      const products = await PenseAjaService.fetchProducts(dassOffice);
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  async purchaseProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { registration } = req.params;
      const { product, colaboradorData, analista, dassOffice } =
        req.body as PurchaseProductPayload;

      if (Number.isNaN(Number(registration))) {
        res.status(400).json({ message: "Matrícula Inválida." });
        return;
      }

      const result = await PenseAjaService.purchaseProductByRegistration(Number(registration), {
        product,
        colaboradorData,
        analista,
        dassOffice,
        actorRegistration: req.authContext?.registration,
        actorName: req.authContext?.username,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { dassOffice } = req.params;
      const productData = req.body as ProductUpdateInput[];
      const user = req.user;

      if (!dassOffice) {
        res.status(400).json({
          erro: true,
          mensagem: "O campo 'dassOffice' é obrigatório.",
          dados: "Não há registros!",
        });
        return;
      }

      const result = await PenseAjaService.updateProduct(
        productData,
        dassOffice,
        user?.usuario as string
      );

      res.status(200).json({
        message: "Produto atualizado com sucesso!",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async listIdeas(req: Request, res: Response, next: NextFunction) {
    try {
      const { dassOffice } = req.params;
      const { startDate, endDate, name, sector, manager, project, turno, status } = req.query;

      if (!dassOffice) {
        res.status(400).json({
          erro: true,
          mensagem: "O campo 'dassOffice' é obrigatório.",
          dados: "Não há registros!",
        });
        return;
      }

      if (typeof startDate === "string" && isInvalidDate(startDate)) {
        res.status(400).json({
          erro: true,
          mensagem: "Insira uma data válida.",
          dados: "Não há registros!",
        });
        return;
      }

      if (typeof endDate === "string" && isInvalidDate(endDate)) {
        res.status(400).json({
          erro: true,
          mensagem: "Insira uma data válida.",
          dados: "Não há registros!",
        });
        return;
      }

      const startDateParsed = new Date(startDate as string);
      const endDateParsed = new Date(endDate as string);

      const result = await PenseAjaService.fetchPenseAja(
        dassOffice,
        startDateParsed,
        endDateParsed,
        name as string,
        sector as string,
        manager as string,
        project as string,
        turno as string,
        status as string
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async createIdea(req: Request, res: Response, next: NextFunction) {
    try {
      const { dassOffice } = req.params;
      const result = await PenseAjaService.submitPenseAja(
        req.body as PenseAjaData,
        dassOffice
      );
      res.status(result.statusCode).json(result.body);
    } catch (error) {
      next(error);
    }
  },

  async getIdeaById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, dassOffice } = req.params;
      const result = await PenseAjaService.getPenseAjaById(id, dassOffice);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async evaluateIdea(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PenseAjaService.evaluatePenseAjaWithNotification(id, {
        ...(req.body as Omit<EvaluationData, "usuario" | "funcao">),
        ...(req.user as Pick<EvaluationData, "usuario" | "funcao">),
        actorRegistration: req.authContext?.registration,
        permissions: req.authContext?.permissions,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getIdeaAuditTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, dassOffice } = req.params;
      const result = await PenseAjaService.getIdeaAuditTimeline(
        id,
        assertDassOffice(dassOffice)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
