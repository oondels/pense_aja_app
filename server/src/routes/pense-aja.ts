import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { PenseAjaService } from "../services/penseAjaService";
import { verifyToken } from "../middlewares/auth";
import { CustomError } from '../types/CustomError';

const router = Router();

router.get("/protected", verifyToken, (req: Request, res: Response) => {
  console.log(req.user);

  res.status(200).json({ message: "Protected route accessed!" });
});

// Antigo apiBuscaDados.php
router.get("/:dassOffice", async (req: Request, res: Response) => {
  try {
    const { dassOffice } = req.params;
    const result = await PenseAjaService.getCurrentMonthData(dassOffice);

    res.status(200).json({ dados: result.dados, filters: result.filters, erro: false });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido!";
    res.status(500).json({
      erro: true,
      mensagem: "Erro ao consultar dados do Pense Aja: " + errorMessage,
      dados: "Não há registros!",
    });
  }
});

// Antigo apiBuscaDados.php
router.get("/history/:dassOffice", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dassOffice } = req.params;
    const filter = req.query;

    const result = await PenseAjaService.getHistoryData(dassOffice, filter);

    res.status(200).json({ dados: result.dados, filters: result.filters, erro: false });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido!";

    res.status(500).json({
      erro: true,
      mensagem: "Erro ao consultar histórico de Pense Aja: " + errorMessage,
      dados: "Não há registros!",
    });
  }
});

router.post("/:dassOffice", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dassOffice } = req.params;
    const penseajaData = req.body;

    const newPenseAja = PenseAjaService.createPenseAja(penseajaData);

    res.status(201).json({ message: "Pense aja cadastrado com sucesso!" });
  } catch (error) {
    // next(error);
    // ! continuar daqui
    throw new CustomError("Erro ao cadastrar pense aja.")
  }
});

export default router;
