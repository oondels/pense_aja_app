import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { PenseAjaService } from "../services/penseAjaService";
import { verifyToken } from "../middlewares/auth";
import roleVerificationAccess from "../middlewares/roleVerificationMiddleware";

const router = Router();

router.get("/protected", verifyToken, (req: Request, res: Response) => {
  console.log(req.user);

  res.status(200).json({ message: "Protected route accessed!" });
});

router.get("/:dassOffice", async (req: Request, res: Response) => {
  try {
    const { dassOffice } = req.params;
    const result = await PenseAjaService.getCurrentMonthData(dassOffice);

    res
      .status(200)
      .json({ dados: result.dados, filters: result.filters, erro: false });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido!";
    res.status(500).json({
      erro: true,
      mensagem: "Erro ao consultar dados do Pense Aja: " + errorMessage,
      dados: "Não há registros!",
    });
  }
});

router.get(
  "/history/:dassOffice",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dassOffice } = req.params;
      const filter = req.query;

      const result = await PenseAjaService.getHistoryData(dassOffice, filter);

      res
        .status(200)
        .json({ dados: result.dados, filters: result.filters, erro: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido!";

      res.status(500).json({
        erro: true,
        mensagem: "Erro ao consultar histórico de Pense Aja: " + errorMessage,
        dados: "Não há registros!",
      });
    }
  }
);

router.post(
  "/:dassOffice",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dassOffice } = req.params;
      const penseajaData = req.body;

      await PenseAjaService.createPenseAja(penseajaData, dassOffice);

      res.status(201).json({ message: "Pense aja cadastrado com sucesso!" });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/id/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const dassOffice = req.query.dassOffice as string;

      const result = await PenseAjaService.getPenseAjaById(id, dassOffice);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// TODO: Após atualizar o registro, atualizar o cache no front-end
router.put(
  "/avaliar/:id",
  verifyToken,
  roleVerificationAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const { id } = req.params;

      const evaluationData = {
        ...req.user,
        ...data,
      };

      const newEvaluation = await PenseAjaService.evaluatePenseAja(
        id,
        evaluationData
      );

      res.json(newEvaluation);
      // res.status(200).json({
      //   message: "Pense Aja avaliado com sucesso!",
      //   data: newEvaluation,
      // });
      return;
    } catch (error) {
      next(error);
    }
  }
);

export default router;
