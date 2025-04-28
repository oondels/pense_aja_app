import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { UserPenseaja } from "../services/UserPenseaja";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get("/:registration", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registration } = req.params;
    const { dassOffice } = req.query;

    if (registration.length < 7) {
      res.status(400).json({ message: "Matricula inválida. O tamanho mínimo deve ser 7." });
      return;
    }

    let matricula = Number(registration);
    if (!matricula) {
      res.status(400).json({ message: "Dados inválidos. Matrícula deve ser um número válido!" });
      return;
    }

    if (typeof dassOffice !== "string") {
      res.status(400).json({ message: "Dados inválidos. Unidade Dass deve ser uma string!" });
      return;
    }

    const userData = await UserPenseaja.getUserData(matricula, dassOffice);

    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
});

router.get("/unidade/:registration", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registration } = req.params;

    if (typeof registration !== "string") {
      res.status(400).json({ message: "Dados inválidos. Registro deve ser uma string!" });
      return;
    }

    const dassOffice = {
      "3": "SEST",
      "2": "SEST",
      "4": "VDC",
      "5": "ITB",
    } as const;

    type DassOfficeKey = keyof typeof dassOffice;
    const firstDigit = registration.charAt(0);
    let officeName;

    if (firstDigit in dassOffice) {
      officeName = dassOffice[firstDigit as DassOfficeKey];
    } else {
      res.status(400).json({ message: "Registro inválido. Matrícula desconhecida!" });
      return;
    }

    res.status(200).json({ dassOffice: officeName, message: `Matrícula validada, unidade: ${officeName}` });
  } catch (error) {
    next(error);
  }
});

export default router;
