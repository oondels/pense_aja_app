import { NextFunction, Request, Response } from "express";
import { UnitSettingsService } from "../services/unit-settings.service";
import { UpsertUnitSettingsInput } from "../types/contracts";

const getAuthContext = (req: Request) => {
  if (!req.authContext) {
    throw new Error("Contexto autenticado não encontrado.");
  }
  return req.authContext;
};

export const UnitSettingsController = {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UnitSettingsService.getSettings(req.params.dassOffice);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UnitSettingsService.upsertSettings(
        req.params.dassOffice,
        req.body as UpsertUnitSettingsInput,
        getAuthContext(req)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
