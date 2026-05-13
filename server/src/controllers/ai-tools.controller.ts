import { NextFunction, Request, Response } from "express";
import AIService from "../services/ai.service";
import { ImproveTextRequest, ImproveTextResponse } from "../types/contracts";

export const AiToolsController = {
  async improveText(req: Request, res: Response, next: NextFunction) {
    try {
      const { situationBefore, situationNow, projectName } = req.body as ImproveTextRequest;

      const hasInvalidParam = Object.values(req.body).some(
        (value) => typeof value !== "string" || value.trim() === ""
      );

      if (hasInvalidParam) {
        res.status(400).json({
          message:
            "Parâmetros incorretos. Todos os campos devem ser textos e não podem estar vazios.",
        });
        return;
      }

      const result = await AIService.improveText(projectName, situationBefore, situationNow);
      const response: ImproveTextResponse = { result };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
