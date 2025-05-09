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

    const { userOffice, location } = await UserPenseaja.getUserOffice(registration);
    if (!userOffice) {
      res.status(400).json({ message: "Registro inválido. Matrícula desconhecida!" });
      return
    }

    res.status(200).json({ dassOffice: userOffice, message: `Matrícula validada, unidade: ${location ?? userOffice}` });
  } catch (error) {
    next(error);
  }
});

// Atualiza perfil do usuario (Notificações)
router.put("/:registration", verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { registration } = req.params;
    const { formData, dassOffice } = req.body;

    if (registration.length < 7) {
      res.status(400).json({ message: "Matricula inválida. O tamanho mínimo deve ser 7." });
      return;
    }

    let matricula = Number(registration);
    if (!matricula) {
      res.status(400).json({ message: "Dados inválidos. Matrícula deve ser um número válido!" });
      return;
    }

    if (typeof formData?.email !== "string") {
      res.status(400).json({ message: "Email Inválido!" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData?.email)) {
      res.status(400).json({ message: "Email inválido!" });
      return;
    }

    if (!formData?.email.includes("@grupodass.com.br")) {
      res.status(400).json({ message: "Insira um email do Grupo Dass!" });
      return;
    }

    const updatedUser = await UserPenseaja.updateUserData(matricula, dassOffice, formData);

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error)
  }
})

export default router;
