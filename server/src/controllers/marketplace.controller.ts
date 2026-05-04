import { NextFunction, Request, Response } from "express";
import { MarketplaceService } from "../services/marketplace.service";
import {
  CreateMarketplaceRequestInput,
  ExecuteFulfillmentInput,
  MarketplaceTransitionInput,
  UpsertCatalogItemInput,
} from "../types/contracts";

const getAuthContext = (req: Request) => {
  if (!req.authContext) {
    throw new Error("Contexto autenticado não encontrado.");
  }
  return req.authContext;
};

export const MarketplaceController = {
  async listCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.listCatalog(req.params.dassOffice);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async upsertCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.upsertCatalogItems(
        req.params.dassOffice,
        req.body as UpsertCatalogItemInput[],
        getAuthContext(req)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.createRequest(
        req.body as CreateMarketplaceRequestInput,
        getAuthContext(req)
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async listRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.listRequests(
        String(req.query.dassOffice)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async approveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.approveRequest(
        req.params.id,
        req.body as MarketplaceTransitionInput,
        getAuthContext(req)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.rejectRequest(
        req.params.id,
        req.body as MarketplaceTransitionInput,
        getAuthContext(req)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async executeFulfillment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.executeFulfillment(
        req.params.id,
        req.body as ExecuteFulfillmentInput,
        getAuthContext(req)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async completeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.completeRequest(
        req.params.id,
        req.body as MarketplaceTransitionInput,
        getAuthContext(req)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async cancelRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.cancelRequest(
        req.params.id,
        req.body as MarketplaceTransitionInput,
        getAuthContext(req)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async refundRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MarketplaceService.refundRequest(
        req.params.id,
        req.body as MarketplaceTransitionInput,
        getAuthContext(req)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
