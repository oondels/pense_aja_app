import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { UserPenseaja } from "../services/UserPenseaja";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get("/:registration", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registration } = req.params;

    if (registration.length < 7) {
      res.status(400).json({ message: "Matricula inválida. O tamanho mínimo deve ser 7." });
      return;
    }

    let matricula = Number(registration);
    if (!matricula) {
      res.status(400).json({ message: "Dados inválidos. Matrícula deve ser um número válido!" });
      return;
    }

    const userData = await UserPenseaja.getUserData(matricula);
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
});

export default router;
